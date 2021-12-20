import {
  Component,
  OnInit,
  Input,
  ViewChild,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { ActivitiesService } from "../../services/activities.service";
import { ActivitiesByGroup } from "../../models/activities-by-group";

import { DataProviderSourceSystem, StemeXeGroupType, StemeXeListType } from "../../enums";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivityUtilsService } from "../../../shared/utils-activity.service";
import * as moment from "moment";
import { delay } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
// import { SimplestrataAuthService } from "src/app/shared/services/simplestrata-auth.service";
import { MatDialog } from "@angular/material/dialog";
import { ActivityDialog } from "../../dialogs/activity-dialog/activity-dialog";
import { FiltersDialog } from "../../dialogs/filters-dialog/filters-dialog";
import { Activity } from "../../models/activity";
import { OppProDialog } from "../../dialogs/opp-pro-dialog/opp-pro-dialog";
import { forkJoin, Subject, Subscription, SubscriptionLike } from "rxjs";
import { Addon } from "../../../shared/models/addon.model-activity";
import { AllowedActionsService } from "../../services/allowed-actions.service";
import { EpmSettingsDialogComponent } from "../../dialogs/epm-settings-dialog/epm-settings-dialog.component";
import { CalendarDateFormatter, CalendarView } from "angular-calendar";
import { CustomDateFormatter } from "../../services/calendar-custom-formatter";
import * as Highcharts from "highcharts";
import { ActivitySharedService } from "../../services/activity-shared.service";
import { ActivityAlertService } from "src/app/activities/shared/alert/alert-activity.service";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { SimplestrataAuthService } from "src/app/activities/shared/services/simplestrata-auth.service";
// import { StemexeDataProviderService } from "src/app/data-providers/services/stemexe-data-provider.service";
declare var require: any;
let Boost = require("highcharts/modules/boost");
let noData = require("highcharts/modules/no-data-to-display");
let More = require("highcharts/highcharts-more");

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
//declare var Carousel: any;
@Component({
  selector: "xcdrs-mine-activities",
  templateUrl: "./mine-activities.component.html",
  styleUrls: ["./mine-activities.component.scss"],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class MineActivitiesComponent implements OnInit {
  indicators = [];
  graphTitle = "Today's Efficiency";
  graphSubTitle = "";
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  isReloadingList: boolean = false;
  isError: boolean = false;
  isFirstRow: boolean = false;
  activitiesByGroup: ActivitiesByGroup = new ActivitiesByGroup();
  search: string = '';
  dataLoaded: boolean = false;
  listReloaded: boolean = false;
  showImportant: boolean = false;
  isDefultFilterApplied: boolean = true;
  isWeekLoading: boolean = false;
  isEpmConnected: boolean = !!localStorage.getItem("epmConnectuionData")
    ? true
    : false;
  groupByAppliedFilter: number = StemeXeGroupType.None;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  groupByOptions: { id: number; name: string }[] = [
    { id: StemeXeGroupType.None, name: "None" },
    { id: StemeXeGroupType.DueDate, name: "By Due Dates" },
    { id: StemeXeGroupType.Project, name: "By Boards" },
    { id: StemeXeGroupType.Week, name: "By Weeks" },
    { id: StemeXeGroupType.Graph, name: "By Graphical view" },
  ];

  arabicGroupByOptions: { id: number; name: string }[] = [
    { id: StemeXeGroupType.None, name: "لا أحد" },
    { id: StemeXeGroupType.DueDate, name: "حسب تواريخ الاستحقاق" },
    { id: StemeXeGroupType.Project, name: "بواسطة المجالس" },
    { id: StemeXeGroupType.Week, name: "قبل أسابيع" },
    { id: StemeXeGroupType.Graph, name: "من خلال عرض رسومي" },
  ];

  activityTypes: { id: number; name: string }[] = [
    { id: 0, name: "task" },
    { id: 1, name: "call" },
    { id: 2, name: "meeting" },
    { id: 3, name: "proposal" },
  ];

  size: string;
  loggedInUserId: any;
  selectedFiltersIds: any = {
    IsFollowed: true,
    IsImportant: false,
    StatusIds: [6, 5],
  };
  selectedFilters: Array<any> = [];
  isListViewActive: boolean = true;
  pageIndex: number = 1;
  overDue: number = 0;
  close: number = 0;
  open: number = 0;
  pageSize: number = 10; //10000;
  totalCount: number = 0;
  lastLoadedCount: number = 0;
  isAllUngroupedActivitiesLoaded: boolean = false;
  tempUngroupedActivitiesArr: Array<any> = new Array();
  tempGroupedActivitiesArr: Array<any> = new Array();
  isAllGroupActivitiesLoaded: Array<boolean> = new Array();
  view: CalendarView = CalendarView.Week;
  private _options: any;
  @Input() isEngProEnabled: boolean = false;
  @Input() isESPcomponent: boolean = false;
  @Input() engProLoggedInUserId: string = '';
  @Input() engProUsers: Array<any> = [];
  @Input() engProTeams: Array<any> = [];
  @Input() isOppProEnabled: boolean = false;
  @Input() oppProData: any = null;

  @Input() isEspEnabled: boolean = false;
  @Input() espAddon: Addon = null;
  @Input() requestName: any = null;
  @Input() requestModuleName: any = null;
  activitiesSubject: Subject<Activity[]> = new Subject<Activity[]>();
  tableList: Activity[] = [];
  @ViewChild("scrollableContainer")
  scrollableContainer: ElementRef;

  activeTab: number = StemeXeListType.Mine;
  isFiltersDialogOpened: boolean = false;

  // graph data

  graphData: any;
  isWeekDay: boolean = false;
  isDashboardClicked: boolean = false;
  allWeekEfficiency: any[] = [];
  next: boolean = true;
  previous: boolean = true;
  isArabic:boolean = false;
  isWeekView: boolean = false;
  arabicTitle: string = "كفاءة اليوم";
  isSubscribed:boolean = false;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  subscrip : SubscriptionLike;
  subscription: Subscription;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  allProviders: any = [];
  constructor(
    private _activitiesService: ActivitiesService,
    private _resizeService: ActivityResizeService,
    private _router: Router,
    private _utils: ActivityUtilsService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    private _allowedActions: AllowedActionsService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private activitySharedService: ActivitySharedService,
    // private _StemexeDataProvider: StemexeDataProviderService,
  ) {
    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this.route.queryParams.subscribe(params => {
      if (params["SourceSystemId"]) {
        this.SourceSystemId = +params["SourceSystemId"];
      } else {
        this.SourceSystemId = null;
      }
      if (params["SourceTenantId"]) {
        this.SourceTenantId = +params["SourceTenantId"];
      } else {
        this.SourceTenantId = null;
      }
      if (params["SourceObjectTypeId"]) {
        this.SourceObjectTypeId = +params["SourceObjectTypeId"];
      } else {
        this.SourceObjectTypeId = null;
      }
      if (params["SourceObjectId"]) {
        this.SourceObjectId = +params["SourceObjectId"];
      } else {
        this.SourceObjectId = null;
      }
      if (params["fromTab"]) {
        this.fromTab = params["fromTab"];
      } else {
        this.fromTab = null;
      }
      if (params["teamId"]) {
        this.teamId = +params["teamId"];
      } else {
        this.teamId = null;
      }
      if (params["selectedTab"]) {
        this.scoreCardSelectedTab = +params["selectedTab"];
      } else {
        this.scoreCardSelectedTab = null;
      }
      if(!this.teamId) {
        this.selectedFiltersIds = {
          IsFollowed: true,
          IsImportant: false,
          StatusIds: [6, 5],
        };
      }
      this.getRootData();
    });
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];

      if (this.size == "XS" || this.size == "SM") {
        this.pageSize = 10;
      }
      this.search = null;
    });
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (!this.isFiltersDialogOpened) {
      if ((this.size == "XS" || this.size == "SM") && !this.isLoadingMore) {
        let pos =
          (window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0) + document.documentElement.offsetHeight;
        let max = document.documentElement.scrollHeight - 766;
        if (pos > max) {
          if (this.groupByAppliedFilter == StemeXeGroupType.None) {
            if (!this.isAllUngroupedActivitiesLoaded) {
              this.pageIndex++;
              this.loadMore(this.selectedFiltersIds);
            }
          } else {
            //load graph list
          }
        }
      }
    }
  }

  onScroll(group: any, i: number) {
    if ((this.size == "XS" || this.size == "SM") && !group.isLoadingMore) {
      let el = document.querySelector(".group-list-" + i) as HTMLElement;
      let pos = el.scrollTop + el.offsetHeight;
      let max = el.scrollHeight - 100;
      if (pos > max) {
        if (!group.isAllActivitiesLoaded) {
          group.pageIndex++;
          this.loadMore(this.selectedFiltersIds, group, i);
        }
      }
    }
  }

  ngOnInit(): void {
    this.getLanguage();
    // let isSubscribe = 1;
    // this.activitySharedService.currentMessage.subscribe((message) => { 
    //   if(message) {
    //     // isSubscribe = 0;
    //     this.loadUngroupedActivities(this.selectedFiltersIds);
    //     this.getGraphDetailForMine();
    //   }
    // });
    //if(!this.isSubscribed) {
      // console.log("ngOnInit");
      this.loadUngroupedActivities(this.selectedFiltersIds);
      this.getGraphDetailForMine();
    //}
    this.getAllAvailableDataProviders();
    this.setGroutOptions();
  }

  setGroutOptions() {
    if(!this.teamId) {
      this.groupByOptions = [
        { id: StemeXeGroupType.None, name: "None" },
        { id: StemeXeGroupType.DueDate, name: "By Due Dates" },
        { id: StemeXeGroupType.Project, name: "By Boards" },
        { id: StemeXeGroupType.Week, name: "By Weeks" },
        { id: StemeXeGroupType.Graph, name: "By Graphical view" },
      ];
      this.arabicGroupByOptions = [
        { id: StemeXeGroupType.None, name: "لا أحد" },
        { id: StemeXeGroupType.DueDate, name: "حسب تواريخ الاستحقاق" },
        { id: StemeXeGroupType.Project, name: "بواسطة المجالس" },
        { id: StemeXeGroupType.Week, name: "قبل أسابيع" },
        { id: StemeXeGroupType.Graph, name: "من خلال عرض رسومي" },
      ];
    } else if(this.teamId){
      this.groupByOptions = [
        { id: StemeXeGroupType.None, name: "None" },
        { id: StemeXeGroupType.DueDate, name: "By Due Dates" },
        { id: StemeXeGroupType.Week, name: "By Weeks" }
      ];
      this.arabicGroupByOptions = [
        { id: StemeXeGroupType.None, name: "لا أحد" },
        { id: StemeXeGroupType.DueDate, name: "حسب تواريخ الاستحقاق" },
        { id: StemeXeGroupType.Week, name: "قبل أسابيع" },
      ];
    }
  }

  getRootData() {
    this.isSubscribed = true;
    this.loadUngroupedActivities(this.selectedFiltersIds);
    this.getGraphDetailForMine();
  }

  getAllAvailableDataProviders() {
    // this._StemexeDataProvider.getDataProviders('ActivitySource').subscribe(data => {
    //   console.log("data providers ", data);
    //   this.allProviders = data;
    // });
    // const oppPro = this.allProviders.filter(obj => obj.id == DataProviderSourceSystem.OppPro);
    // // if(oppPro && oppPro.length) {
    // //   this.isOppProEnabled = true;
    // // }
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  //load groups
  loadGroups() {
    this.search == "" ? (this.search = null) : "";
    this.isLoading = true;
    this._activitiesService
      .getAllGroupsForMine(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds,
        this.engProLoggedInUserId,
        this.oppProData,
        this.isOppProEnabled
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.activitiesByGroup.groups = !!resp.ResponseResult.Groups
                ? resp.ResponseResult.Groups.map((groupRec) => {
                    return {
                      groupId: groupRec.Id,
                      groupName: groupRec.Name,
                      groupCount: groupRec.Count,
                      startDate: groupRec.StartDate,
                      endDate: groupRec.EndDate,
                      subType: groupRec.SubType,
                      groupList: [],
                      isGroupExpanded: false,
                      isGroupActivitiesLoading: false,
                      pageIndex: 1,
                      isAllActivitiesLoaded: groupRec.Count == 0 ? true : false,
                      isLoadingMore: false,
                      lastLoadedCount: 0,
                    };
                  })
                : [];

              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.isError = true;
          this.dataLoaded = false;
          this.isLoading = false;
        }
      );
  }

  //load Activities of a group
  loadGroupActivities(index?: number, group?: any, filter?: any) {
    group.isGroupExpanded = !group.isGroupExpanded;
    this.activitiesByGroup.groups.forEach((grp) => {
      if (grp.groupId != group.groupId) {
        group.isGroupExpanded = false;
      }
    });

    filter = this.setTeamIdForScoreCardInFilter(filter);
    if (group.isGroupExpanded) {
      this.search == "" ? (this.search = null) : "";
      group.isGroupActivitiesLoading = true;
      forkJoin([
        this._activitiesService.getAllByGroupForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
        this._activitiesService.getCountForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.totalCount = response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            if (resp.ResponseCode == 2000) {
              this.lastLoadedCount = resp.ResponseResult.Activities.length;
              this.activitiesByGroup.groups[index].groupList = !!resp
                .ResponseResult.Activities
                ? resp.ResponseResult.Activities.map((listRec) => {
                    return {
                      id:
                        listRec.AppType == 3
                          ? listRec.EpmInfo.TaskId
                          : listRec.Id,
                      epmInfo: listRec.EpmInfo,
                      // appType:
                      //   listRec.ESP_RequestId != null ? 4 : listRec.AppType,
                      appType:
                      listRec.SourceSystemTypeId == null ? 0 : listRec.SourceSystemTypeId == 1 ? 4 : listRec.SourceSystemTypeId == 2 ? 1 : listRec.SourceSystemTypeId == 3 ? 2 :listRec.SourceSystemTypeId == 4 ? 3 : listRec.SourceSystemTypeId == 5 ? 5 : null,
                      requestId: listRec.ESP_RequestId,
                      requestName: listRec.ESP_RequestName,
                      requestNumber: listRec.ESP_RequestNumber,
                      tacticTitle: listRec.TacticTitle,
                      description: listRec.Description,
                      name: listRec.Description,
                      targetValue: listRec.TargetValue,
                      actualValue: listRec.ActualValue,
                      createdBy_UserId: listRec.CreatedBy_UserId,
                      score: listRec.Score,
                      userOwner: listRec.UserOwner,
                      dueDateLabel: this._utils.getDueDateLabel(
                        listRec.DueDate
                      ),
                      // dueDate:
                      //   this._utils.getDueDateLabel(listRec.DueDate) ==
                      //   "Overdue"
                      //     ? this._utils.getDueDateTimeAgo(listRec.DueDate)
                      //     : this._utils.getDueDateLabel(listRec.DueDate) ==
                      //       "Due Today"
                      //     ? "Today"
                      //     : moment(listRec.DueDate).format("DD MMM YYYY"),
                      
                      dueDate:
                      this._utils.getDueDateLabel(listRec.DueDate) ==
                      "Overdue"
                        ? this._utils.getDueDateTimeAgo(listRec.DueDate)
                        : this._utils.getDueDateLabel(listRec.DueDate) ==
                          "Due Today"
                        ? "Today"
                        : listRec.DueDate,
                      effortInHour: listRec.EffortInHour,
                      effortInMinute: listRec.EffortInMinute,
                      effortSum: listRec.EffortSum,
                      unit: listRec.Unit,
                      parentBoardId: listRec.ParentBoardId,
                      parentBoardName: listRec.ParentBoardName,
                      status: listRec.Status,
                      progressStatus: listRec.IsRejected
                        ? "Rejected"
                        : (listRec.AppType != 2 &&
                            listRec.Status == 4 &&
                            !listRec.IsReassigned) ||
                          (listRec.AppType == 2 &&
                            listRec.OppProStatus == "Cancelled")
                        ? "Cancelled"
                        : listRec.AppType != 2 &&
                          listRec.Status == 4 &&
                          listRec.IsReassigned
                        ? "Reassigned"
                        : (listRec.AppType != 2 && listRec.Status == 2) ||
                          (listRec.AppType == 2 &&
                            (listRec.OppProStatus == "Completed" ||
                              listRec.OppProStatus == "Sent"))
                        ? "Done"
                        : listRec.ActualValue == null && listRec.AppType != 2
                        ? "Not Started"
                        : listRec.AppType == 2 &&
                          (listRec.OppProStatus == "Planned" ||
                            listRec.OppProStatus == null)
                        ? "Planned"
                        : "In progress",
                      progressStatusColor:
                        listRec.AppType != 2 && listRec.IsRejected
                          ? "#EB487F"
                          : (listRec.AppType != 2 && listRec.Status == 4) ||
                            (listRec.AppType == 2 &&
                              listRec.OppProStatus == "Cancelled")
                          ? "#EB487F"
                          : (listRec.AppType != 2 && listRec.Status == 2) ||
                            (listRec.AppType == 2 &&
                              (listRec.OppProStatus == "Completed" ||
                                listRec.OppProStatus == "Sent"))
                          ? "#33BA70"
                          : listRec.AppType != 2 && listRec.ActualValue == null
                          ? //   ||
                            // (listRec.AppType == 2 &&
                            //   (listRec.OppProStatus == "Planned" ||
                            //     listRec.OppProStatus == null))
                            "#8795b1"
                          : "#00a3ff",
                      createdBy: listRec.CreatedBy,
                      isHover: false,

                      isShared: listRec.IsShared,
                      maxClaims: listRec.MaxClaims,
                      totalClaims: listRec.TotalClaims,
                      isRowBefore: false,
                      owner_UserId: listRec.Owner_UserId,
                      allowedActions: this._allowedActions.getAllowedActions(
                        listRec.Owner_UserId,
                        listRec.CreatedBy_UserId,
                        listRec.AppType == 1
                          ? parseInt(this.engProLoggedInUserId)
                          : parseInt(this.loggedInUserId),
                        this._utils.getActivityStatus(
                          listRec.Status,
                          listRec.ActualValue,
                          listRec.IsShared
                        ),
                        listRec.AllowedActions,
                        listRec.IsAccepted,
                        listRec.IsReassigned,
                        listRec.AppType == 1 ? true : false,
                        listRec.DueDate,
                        listRec.MaxClaims,
                        listRec.TotalClaims,
                        undefined
                      ),
                      oppProActivityType: listRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        listRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        listRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      // oppProStatus:
                      //   listRec.OppProStatus == "Cancelled"
                      //     ? "Cancelled"
                      //     : listRec.OppProStatus == "Completed" ||
                      //       listRec.OppProStatus == "Sent"
                      //     ? "Done"
                      //     : listRec.OppProStatus == "Planned" ||
                      //       listRec.OppProStatus == null
                      //     ? "Not Started"
                      //     : "In progress",
                    };
                  })
                : [];

              this.isError = false;
              group.isGroupActivitiesLoading = false;

              if (this.pageIndex == 1) {
                setTimeout(() => {
                  this.activitiesSubject.next(
                    this.activitiesByGroup.groups[index].groupList
                  );
                }, 500);
              } else {
                this.activitiesSubject.next(
                  this.activitiesByGroup.groups[index].groupList
                );
              }
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });

              this.isError = false;
              group.isGroupActivitiesLoading = false;
            }
          }
        },
        (error: Error): void => {
          this.isError = true;
          group.isGroupActivitiesLoading = false;
        }
      );
    } else {
      group.groupList = [];
      group.isLoadingMore = false;
      group.pageIndex = 1;
      group.isAllActivitiesLoaded = false;
      group.isGroupActivitiesLoading = false;
      group.lastLoadedCount = 0;
      group.isGroupExpanded = false;
    }
  }

  //Load ungrouped activities
  loadUngroupedActivities(filter?: any) {
    this.search == "" ? (this.search = null) : "";
    this.isLoading = true;
    filter = this.setTeamIdForScoreCardInFilter(filter);
    forkJoin([
      this._activitiesService.getAllByGroupForMine(
        this.search,
        this.groupByAppliedFilter,
        this.pageSize,
        this.pageIndex,
        undefined,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId,
        this.oppProData,
        this.isOppProEnabled
      ),
      this._activitiesService.getCountForMine(
        this.search,
        this.groupByAppliedFilter,
        this.pageSize,
        this.pageIndex,
        undefined,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId,
        this.oppProData,
        this.isOppProEnabled
      ),
      this._activitiesService.getAllByWeeksForMine(this.engProLoggedInUserId),
    ]).subscribe(
      (response) => {
        if (!!response) {
          this.allWeekEfficiency = response[2].ResponseResult.Weeks;
          this.next = this.allWeekEfficiency[this.allWeekEfficiency.length-1].WeekName == 'This Week' ? false : true;
          this.previous = this.allWeekEfficiency[0].WeekName == 'Previous Week' ? false : true;
          this.totalCount = response[1].ResponseResult.ActivityCount;
          let resp = response[0];
          if (resp.ResponseCode == 2000) {
            if (
              !!resp.ResponseResult.WeekDays &&
              resp.ResponseResult.WeekDays != null
            ) {
              this.activitiesByGroup.weekDays = {
                effortSum: this.calculateffortsHours(
                  resp.ResponseResult.WeekDays.EffortSum
                ),
                effortSumHours: Math.floor(
                  moment
                    .duration(resp.ResponseResult.WeekDays.EffortSum, "minutes")
                    .asHours()
                ),
                effortSumMinutes: Math.floor(
                  moment
                    .duration(
                      moment
                        .duration(
                          resp.ResponseResult.WeekDays.EffortSum,
                          "minutes"
                        )
                        .asHours() -
                        Math.floor(
                          moment
                            .duration(
                              resp.ResponseResult.WeekDays.EffortSum,
                              "minutes"
                            )
                            .asHours()
                        ),
                      "hours"
                    )
                    .asMinutes()
                ),
                days: !!resp.ResponseResult.WeekDays.Days
                  ? resp.ResponseResult.WeekDays.Days.map((dayRec) => {
                      return {
                        date: moment(dayRec.Date).format("ddd"),
                        effortSum: this.calculateffortsHours(dayRec.EffortSum),

                        effortSumPercent: this.calculateffortsPercent(
                          this.calculateffortsHours(dayRec.EffortSum)
                        ),
                      };
                    })
                  : [],
              };
              this.cdRef.detectChanges();
            } else {
              this.activitiesByGroup.weekDays = null;
            }

            this.activitiesByGroup.newAssigned = !!resp.ResponseResult
              .NewAssigned
              ? resp.ResponseResult.NewAssigned.map((newAssignedRec) => {
                  return {
                    id: newAssignedRec.Id,
                    appType:
                    newAssignedRec.SourceSystemTypeId == null ? 0 : newAssignedRec.SourceSystemTypeId == 1 ? 4 : newAssignedRec.SourceSystemTypeId == 2 ? 1 : newAssignedRec.SourceSystemTypeId == 3 ? 2 : newAssignedRec.SourceSystemTypeId == 4 ? 3 : newAssignedRec.SourceSystemTypeId == 5 ? 5 : null,
                    requestId: newAssignedRec.ESP_RequestId,
                    requestName: newAssignedRec.ESP_RequestName,
                    requestNumber: newAssignedRec.ESP_RequestNumber,
                    tacticTitle: newAssignedRec.TacticTitle,
                    description: newAssignedRec.Description,
                    targetValue: newAssignedRec.TargetValue,
                    actualValue: newAssignedRec.ActualValue,
                    createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                    score: newAssignedRec.Score,
                    userOwner: newAssignedRec.UserOwner,
                    // dueDate: moment(newAssignedRec.DueDate).format(
                    //   "DD MMM YYYY"
                    // ),

                    dueDate: newAssignedRec.DueDate,

                    startDate: moment(newAssignedRec.StartDate).format(
                      "DD MMM YYYY"
                    ),

                    isOverdue:
                      this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                      "Overdue"
                        ? true
                        : false,
                    effortInHour: newAssignedRec.EffortInHour,
                    effortInMinute: newAssignedRec.EffortInMinute,
                    unit: newAssignedRec.Unit,
                    parentBoardId: newAssignedRec.ParentBoardId,
                    parentBoardName: newAssignedRec.ParentBoardName,
                    status: newAssignedRec.Status,
                    createdBy: newAssignedRec.CreatedBy,
                    owner: newAssignedRec.UserOwner,
                    isHover: false,
                    isRowBefore: false,
                    isReassigned: newAssignedRec.IsReassigned,
                    isRejected: newAssignedRec.IsRejected,
                    isShared: newAssignedRec.IsShared,
                    isImportant: newAssignedRec.IsImportant,
                    isFollowed: newAssignedRec.IsFollowed,
                    maxClaims: newAssignedRec.MaxClaims,
                    totalClaims: newAssignedRec.TotalClaims,
                    oppProActivityType: newAssignedRec.OppProActivityType,

                    oppProScheduleEndDate: moment(
                      newAssignedRec.OppProScheduleEndDate
                    ).format("hh:mm A"),
                    oppProScheduleStartDate: moment(
                      newAssignedRec.OppProScheduleStartDate
                    ).format("hh:mm A"),
                    // oppProStatus:
                    //   newAssignedRec.OppProStatus == "Cancelled"
                    //     ? "Cancelled"
                    //     : newAssignedRec.OppProStatus == "Completed" ||
                    //       newAssignedRec.OppProStatus == "Sent"
                    //     ? "Done"
                    //     : newAssignedRec.OppProStatus == "Planned" ||
                    //       newAssignedRec.OppProStatus == null
                    //     ? "Not Started"
                    //     : "In progress",
                  };
                })
              : [];

            if (this.size == "XS" || this.size == "SM") {
              this.tempUngroupedActivitiesArr = !!this.activitiesByGroup
                .ungrouped
                ? this.activitiesByGroup.ungrouped
                : [];
            }

            this.lastLoadedCount = resp.ResponseResult.Activities.length;
            this.activitiesByGroup.ungrouped = !!resp.ResponseResult.Activities
              ? resp.ResponseResult.Activities.map((ungroupedRec) => {
                console.log("3333333333333333333333333333");
                  return {
                    id:
                      ungroupedRec.AppType == 3
                        ? ungroupedRec.EpmInfo.TaskId
                        : ungroupedRec.Id,
                    epmInfo: ungroupedRec.EpmInfo,
                    // appType:
                    //   ungroupedRec.ESP_RequestId != null
                    //     ? 4
                    //     : ungroupedRec.AppType,
                    appType: ungroupedRec.SourceSystemTypeId == null ? 0 : ungroupedRec.SourceSystemTypeId == 1 ? 4 : ungroupedRec.SourceSystemTypeId == 2 ? 1 : ungroupedRec.SourceSystemTypeId == 3 ? 2 :ungroupedRec.SourceSystemTypeId == 4 ? 3 : ungroupedRec.SourceSystemTypeId == 5 ? 5 : null,
                    userOwner: ungroupedRec.UserOwner,
                    requestId: ungroupedRec.ESP_RequestId,
                    requestName: ungroupedRec.ESP_RequestName,
                    requestNumber: ungroupedRec.ESP_RequestNumber,
                    tacticTitle: ungroupedRec.TacticTitle,
                    description: ungroupedRec.Description,
                    name: ungroupedRec.Description,
                    targetValue: ungroupedRec.TargetValue,
                    actualValue: ungroupedRec.ActualValue,
                    // userOwner: ungroupedRec.UserOwner,
                    createdBy_UserId: ungroupedRec.CreatedBy_UserId,
                    score: ungroupedRec.Score,
                    dueDateLabel: this._utils.getDueDateLabel(
                      ungroupedRec.DueDate
                    ),
                    // dueDate:
                    //   this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                    //   "Overdue"
                    //     ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                    //     : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                    //       "Due Today"
                    //     ? "Today"
                    //     : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),

                    dueDate:
                      this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                      "Overdue"
                        ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                        : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                          "Due Today"
                          ? (!this.isArabic ? "Today" : "اليوم")
                          : ungroupedRec.DueDate,
                    startDate: moment(ungroupedRec.StartDate).format(
                      "DD MMM YYYY"
                    ),    
                    effortInHour: ungroupedRec.EffortInHour,
                    effortInMinute: ungroupedRec.EffortInMinute,
                    effortSum: ungroupedRec.EffortSum,
                    unit: ungroupedRec.Unit,
                    parentBoardId: ungroupedRec.ParentBoardId,
                    parentBoardName: ungroupedRec.ParentBoardName,
                    status: ungroupedRec.Status,

                    progressStatus: ungroupedRec.IsRejected
                      ? "Rejected"
                      : (ungroupedRec.AppType != 2 &&
                          ungroupedRec.Status == 4 &&
                          !ungroupedRec.IsReassigned) ||
                        (ungroupedRec.AppType == 2 &&
                          ungroupedRec.OppProStatus == "Cancelled")
                      ? "Cancelled"
                      : ungroupedRec.AppType != 2 &&
                        ungroupedRec.Status == 4 &&
                        ungroupedRec.IsReassigned
                      ? "Reassigned"
                      : (ungroupedRec.AppType != 2 &&
                          ungroupedRec.Status == 2) ||
                        (ungroupedRec.AppType == 2 &&
                          (ungroupedRec.OppProStatus == "Completed" ||
                            ungroupedRec.OppProStatus == "Sent"))
                      ? "Done"
                      : ungroupedRec.ActualValue == null &&
                        ungroupedRec.AppType != 2
                      ? "Not Started"
                      : ungroupedRec.AppType == 2 &&
                        (ungroupedRec.OppProStatus == "Planned" ||
                          ungroupedRec.OppProStatus == null)
                      ? "Planned"
                      : "In progress",
                    progressStatusColor:
                      ungroupedRec.AppType != 2 && ungroupedRec.IsRejected
                        ? "#EB487F"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 4) ||
                          (ungroupedRec.AppType == 2 &&
                            ungroupedRec.OppProStatus == "Cancelled")
                        ? "#EB487F"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 2) ||
                          (ungroupedRec.AppType == 2 &&
                            (ungroupedRec.OppProStatus == "Completed" ||
                              ungroupedRec.OppProStatus == "Sent"))
                        ? "#33BA70"
                        : ungroupedRec.AppType != 2 &&
                          ungroupedRec.ActualValue == null
                        ? //   ||
                          // (ungroupedRec.AppType == 2 &&
                          //   (ungroupedRec.OppProStatus == "Planned" ||
                          //     ungroupedRec.OppProStatus == null))
                          "#8795b1"
                        : "#00a3ff",
                    createdBy: ungroupedRec.CreatedBy,

                    isHover: false,
                    isRowBefore: false,
                    isReassigned: ungroupedRec.IsReassigned,
                    isAccepted: ungroupedRec.IsAccepted,
                    isApproved: ungroupedRec.IsApproved,
                    isRejected: ungroupedRec.IsRejected,
                    isShared: ungroupedRec.IsShared,
                    isImportant: ungroupedRec.IsImportant,
                    isFollowed: ungroupedRec.IsFollowed,
                    maxClaims: ungroupedRec.MaxClaims,
                    totalClaims: ungroupedRec.TotalClaims,
                    owner_UserId: ungroupedRec.Owner_UserId,
                    allowedActions: this._allowedActions.getAllowedActions(
                      ungroupedRec.Owner_UserId,
                      ungroupedRec.CreatedBy_UserId,
                      ungroupedRec.AppType == 1
                        ? parseInt(this.engProLoggedInUserId)
                        : parseInt(this.loggedInUserId),
                      this._utils.getActivityStatus(
                        ungroupedRec.Status,
                        ungroupedRec.ActualValue,
                        ungroupedRec.IsShared
                      ),
                      ungroupedRec.AllowedActions,
                      ungroupedRec.IsAccepted,
                      ungroupedRec.IsReassigned,
                      ungroupedRec.AppType == 1 ? true : false,
                      ungroupedRec.DueDate,
                      ungroupedRec.MaxClaims,
                      ungroupedRec.TotalClaims,
                      undefined
                    ),
                    oppProActivityType: ungroupedRec.OppProActivityType,
                    oppProScheduleEndDate: moment(
                      ungroupedRec.OppProScheduleEndDate
                    ).format("hh:mm A"),
                    oppProScheduleStartDate: moment(
                      ungroupedRec.OppProScheduleStartDate
                    ).format("hh:mm A"),
                    // oppProStatus:
                    //   ungroupedRec.OppProStatus == "Cancelled"
                    //     ? "Cancelled"
                    //     : ungroupedRec.OppProStatus == "Completed" ||
                    //       ungroupedRec.OppProStatus == "Sent"
                    //     ? "Done"
                    //     : ungroupedRec.OppProStatus == "Planned" ||
                    //       ungroupedRec.OppProStatus == null
                    //     ? "Not Started"
                    //     : "In progress",
                  };
                })
              : [];

            this.dataLoaded = true;
            this.isError = false;
            this.isLoading = false;
            if (this.pageIndex == 1) {
              setTimeout(() => {
                this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
              }, 500);
            } else {
              this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
            }
          } else {
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      },
      (error: Error): void => {
        this.isError = true;
        this.dataLoaded = false;
        this.isLoading = false;
      }
    );
    // this.subscrip.unsubscribe();
  }

  loadLess(filter?: any, group?: any, index?: number) {
    if (this.groupByAppliedFilter == StemeXeGroupType.None) {
      this.isLoadingMore = true;
      this.activitiesByGroup.ungrouped = this.activitiesByGroup.ungrouped.splice(
        0,
        this.activitiesByGroup.ungrouped.length - this.lastLoadedCount
      );
      this.activitiesSubject.next(
        this.activitiesByGroup.ungrouped.length <= 10
          ? this.activitiesByGroup.ungrouped
          : this.activitiesByGroup.ungrouped.slice(-this.lastLoadedCount)
      );
      this.isLoadingMore = false;
    } else {
      group.isLoadingMore = true;
      this.activitiesByGroup.groups[
        index
      ].groupList = this.activitiesByGroup.groups[index].groupList.splice(
        0,
        this.activitiesByGroup.groups[index].groupList.length -
          group.lastLoadedCount
      );
      this.activitiesSubject.next(
        this.activitiesByGroup.groups[index].groupList.length <= 10
          ? this.activitiesByGroup.groups[index].groupList
          : this.activitiesByGroup.groups[index].groupList.slice(
              -group.lastLoadedCount
            )
      );
      group.isLoadingMore = false;
    }
  }

  loadMore(filter?: any, group?: any, index?: number) {
    filter = this.setTeamIdForScoreCardInFilter(filter);
    this.search == "" ? (this.search = null) : "";
    if (this.groupByAppliedFilter == StemeXeGroupType.None) {
      this.isLoadingMore = true;
      forkJoin([
        this._activitiesService.getAllByGroupForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
        this._activitiesService.getCountForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.totalCount = response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            if (resp.ResponseCode == 2000) {
              if (resp.ResponseResult.Activities.length == 0) {
                this.isAllUngroupedActivitiesLoaded = true;
                this.isLoadingMore = false;
                return;
              }

              this.tempUngroupedActivitiesArr = !!this.activitiesByGroup
                .ungrouped
                ? this.activitiesByGroup.ungrouped
                : [];

              this.lastLoadedCount = resp.ResponseResult.Activities.length;
              this.activitiesByGroup.ungrouped = !!resp.ResponseResult
                .Activities
                ? resp.ResponseResult.Activities.map((ungroupedRec) => {
                    return {
                      id:
                        ungroupedRec.AppType == 3
                          ? ungroupedRec.EpmInfo.TaskId
                          : ungroupedRec.Id,
                      epmInfo: ungroupedRec.EpmInfo,
                      appType:
                      ungroupedRec.SourceSystemTypeId == null ? 0 : ungroupedRec.SourceSystemTypeId == 1 ? 4 : ungroupedRec.SourceSystemTypeId == 2 ? 1 : ungroupedRec.SourceSystemTypeId == 3 ? 2 : ungroupedRec.SourceSystemTypeId == 4 ? 3 : ungroupedRec.SourceSystemTypeId == 5 ? 5 : null,
                      requestId: ungroupedRec.ESP_RequestId,
                      requestName: ungroupedRec.ESP_RequestName,
                      requestNumber: ungroupedRec.ESP_RequestNumber,
                      tacticTitle: ungroupedRec.TacticTitle,
                      description: ungroupedRec.Description,
                      name: ungroupedRec.Description,
                      targetValue: ungroupedRec.TargetValue,
                      actualValue: ungroupedRec.ActualValue,
                      createdBy_UserId: ungroupedRec.CreatedBy_UserId,
                      score: ungroupedRec.Score,
                      userOwner: ungroupedRec.UserOwner,
                      dueDateLabel: this._utils.getDueDateLabel(
                        ungroupedRec.DueDate
                      ),
                      // dueDate:
                      //   this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                      //   "Overdue"
                      //     ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                      //     : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                      //       "Due Today"
                      //     ? "Today"
                      //     : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),

                      dueDate:
                        this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                        "Overdue"
                          ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                          : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                            "Due Today"
                            ? (!this.isArabic ? "Today" : "اليوم")
                            : ungroupedRec.DueDate,
                      startDate: moment(ungroupedRec.StartDate).format(
                        "DD MMM YYYY"
                      ),
                      effortInHour: ungroupedRec.EffortInHour,
                      effortInMinute: ungroupedRec.EffortInMinute,
                      effortSum: ungroupedRec.EffortSum,
                      unit: ungroupedRec.Unit,
                      parentBoardId: ungroupedRec.ParentBoardId,
                      parentBoardName: ungroupedRec.ParentBoardName,
                      status: ungroupedRec.Status,
                      progressStatus: ungroupedRec.IsRejected
                        ? "Rejected"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 4 &&
                            !ungroupedRec.IsReassigned) ||
                          (ungroupedRec.AppType == 2 &&
                            ungroupedRec.OppProStatus == "Cancelled")
                        ? "Cancelled"
                        : ungroupedRec.AppType != 2 &&
                          ungroupedRec.Status == 4 &&
                          ungroupedRec.IsReassigned
                        ? "Reassigned"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 2) ||
                          (ungroupedRec.AppType == 2 &&
                            (ungroupedRec.OppProStatus == "Completed" ||
                              ungroupedRec.OppProStatus == "Sent"))
                        ? "Done"
                        : ungroupedRec.ActualValue == null &&
                          ungroupedRec.AppType != 2
                        ? "Not Started"
                        : ungroupedRec.AppType == 2 &&
                          (ungroupedRec.OppProStatus == "Planned" ||
                            ungroupedRec.OppProStatus == null)
                        ? "Planned"
                        : "In progress",
                      progressStatusColor:
                        ungroupedRec.AppType != 2 && ungroupedRec.IsRejected
                          ? "#EB487F"
                          : (ungroupedRec.AppType != 2 &&
                              ungroupedRec.Status == 4) ||
                            (ungroupedRec.AppType == 2 &&
                              ungroupedRec.OppProStatus == "Cancelled")
                          ? "#EB487F"
                          : (ungroupedRec.AppType != 2 &&
                              ungroupedRec.Status == 2) ||
                            (ungroupedRec.AppType == 2 &&
                              (ungroupedRec.OppProStatus == "Completed" ||
                                ungroupedRec.OppProStatus == "Sent"))
                          ? "#33BA70"
                          : ungroupedRec.AppType != 2 &&
                            ungroupedRec.ActualValue == null
                          ? //   ||
                            // (ungroupedRec.AppType == 2 &&
                            //   (ungroupedRec.OppProStatus == "Planned" ||
                            //     ungroupedRec.OppProStatus == null))
                            "#8795b1"
                          : "#00a3ff",
                      createdBy: ungroupedRec.CreatedBy,

                      isHover: false,
                      isRowBefore: false,

                      isReassigned: ungroupedRec.IsReassigned,
                      isAccepted: ungroupedRec.IsAccepted,
                      isApproved: ungroupedRec.IsApproved,
                      isRejected: ungroupedRec.IsRejected,
                      isShared: ungroupedRec.IsShared,
                      isImportant: ungroupedRec.IsImportant,
                      isFollowed: ungroupedRec.IsFollowed,
                      maxClaims: ungroupedRec.MaxClaims,
                      totalClaims: ungroupedRec.TotalClaims,
                      owner_UserId: ungroupedRec.Owner_UserId,
                      allowedActions: this._allowedActions.getAllowedActions(
                        ungroupedRec.Owner_UserId,
                        ungroupedRec.CreatedBy_UserId,
                        ungroupedRec.AppType == 1
                          ? parseInt(this.engProLoggedInUserId)
                          : parseInt(this.loggedInUserId),
                        this._utils.getActivityStatus(
                          ungroupedRec.Status,
                          ungroupedRec.ActualValue,
                          ungroupedRec.IsShared
                        ),
                        ungroupedRec.AllowedActions,
                        ungroupedRec.IsAccepted,
                        ungroupedRec.IsReassigned,
                        ungroupedRec.AppType == 1 ? true : false,
                        ungroupedRec.DueDate,
                        ungroupedRec.MaxClaims,
                        ungroupedRec.TotalClaims,
                        undefined
                      ),
                      oppProActivityType: ungroupedRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        ungroupedRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        ungroupedRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      // oppProStatus:
                      //   ungroupedRec.OppProStatus == "Cancelled"
                      //     ? "Cancelled"
                      //     : ungroupedRec.OppProStatus == "Completed" ||
                      //       ungroupedRec.OppProStatus == "Sent"
                      //     ? "Done"
                      //     : ungroupedRec.OppProStatus == "Planned" ||
                      //       ungroupedRec.OppProStatus == null
                      //     ? "Not Started"
                      //     : "In progress",
                    };
                  })
                : [];

              this.activitiesSubject.next(this.activitiesByGroup.ungrouped);

              for (
                var i = 0;
                i < this.activitiesByGroup.ungrouped.length;
                i++
              ) {
                this.tempUngroupedActivitiesArr.push(
                  this.activitiesByGroup.ungrouped[i]
                );
              }

              this.activitiesByGroup.ungrouped = this.tempUngroupedActivitiesArr;

              this.dataLoaded = true;
              this.isError = false;
              this.isLoadingMore = false;
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });

              this.dataLoaded = true;
              this.isError = false;
              this.isLoadingMore = false;
            }
          }
        },
        (error: Error): void => {
          this.dataLoaded = false;
          this.isError = true;
          this.isLoadingMore = false;
        }
      );
    } else {
      group.isLoadingMore = true;

      forkJoin([
        this._activitiesService.getAllByGroupForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),

        this._activitiesService.getCountForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.totalCount = response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            if (resp.ResponseCode == 2000) {
              if (resp.ResponseResult.Activities.length == 0) {
                group.isAllActivitiesLoaded = true;
                group.isLoadingMore = false;
                return;
              }

              this.tempGroupedActivitiesArr[index] = !!this.activitiesByGroup
                .groups[index].groupList
                ? this.activitiesByGroup.groups[index].groupList
                : [];

              group.lastLoadedCount = resp.ResponseResult.Activities.length;
              this.activitiesByGroup.groups[index].groupList = !!resp
                .ResponseResult.Activities
                ? resp.ResponseResult.Activities.map((listRec) => {
                    return {
                      id:
                        listRec.AppType == 3
                          ? listRec.EpmInfo.TaskId
                          : listRec.Id,
                      epmInfo: listRec.EpmInfo,
                      appType:
                      listRec.SourceSystemTypeId == null ? 0 : listRec.SourceSystemTypeId == 1 ? 4 : listRec.SourceSystemTypeId == 2 ? 1 : listRec.SourceSystemTypeId == 3 ? 2 : listRec.SourceSystemTypeId == 4 ? 3 : listRec.SourceSystemTypeId == 5 ? 5 : null,
                      requestId: listRec.ESP_RequestId,
                      requestName: listRec.ESP_RequestName,
                      requestNumber: listRec.ESP_RequestNumber,
                      tacticTitle: listRec.TacticTitle,
                      description: listRec.Description,
                      name: listRec.Description,
                      targetValue: listRec.TargetValue,
                      actualValue: listRec.ActualValue,
                      createdBy_UserId: listRec.CreatedBy_UserId,
                      score: listRec.Score,
                      userOwner: listRec.UserOwner,
                      dueDateLabel: this._utils.getDueDateLabel(
                        listRec.DueDate
                      ),
                      // dueDate:
                      //   this._utils.getDueDateLabel(listRec.DueDate) ==
                      //   "Overdue"
                      //     ? this._utils.getDueDateTimeAgo(listRec.DueDate)
                      //     : this._utils.getDueDateLabel(listRec.DueDate) ==
                      //       "Due Today"
                      //     ? "Today"
                      //     : moment(listRec.DueDate).format("DD MMM YYYY"),

                      dueDate:
                        this._utils.getDueDateLabel(listRec.DueDate) ==
                        "Overdue"
                          ? this._utils.getDueDateTimeAgo(listRec.DueDate)
                          : this._utils.getDueDateLabel(listRec.DueDate) ==
                            "Due Today"
                          ? (!this.isArabic ? "Today" : "اليوم")
                          : listRec.DueDate,
                      startDate: moment(listRec.StartDate).format(
                        "DD MMM YYYY"
                      ),
                      effortInHour: listRec.EffortInHour,
                      effortInMinute: listRec.EffortInMinute,
                      effortSum: listRec.EffortSum,
                      unit: listRec.Unit,
                      parentBoardId: listRec.ParentBoardId,
                      parentBoardName: listRec.ParentBoardName,
                      status: listRec.Status,
                      progressStatus: listRec.IsRejected
                        ? "Rejected"
                        : (listRec.AppType != 2 &&
                            listRec.Status == 4 &&
                            !listRec.IsReassigned) ||
                          (listRec.AppType == 2 &&
                            listRec.OppProStatus == "Cancelled")
                        ? "Cancelled"
                        : listRec.AppType != 2 &&
                          listRec.Status == 4 &&
                          listRec.IsReassigned
                        ? "Reassigned"
                        : (listRec.AppType != 2 && listRec.Status == 2) ||
                          (listRec.AppType == 2 &&
                            (listRec.OppProStatus == "Completed" ||
                              listRec.OppProStatus == "Sent"))
                        ? "Done"
                        : listRec.ActualValue == null && listRec.AppType != 2
                        ? "Not Started"
                        : listRec.AppType == 2 &&
                          (listRec.OppProStatus == "Planned" ||
                            listRec.OppProStatus == null)
                        ? "Planned"
                        : "In progress",
                      progressStatusColor:
                        listRec.AppType != 2 && listRec.IsRejected
                          ? "#EB487F"
                          : (listRec.AppType != 2 && listRec.Status == 4) ||
                            (listRec.AppType == 2 &&
                              listRec.OppProStatus == "Cancelled")
                          ? "#EB487F"
                          : (listRec.AppType != 2 && listRec.Status == 2) ||
                            (listRec.AppType == 2 &&
                              (listRec.OppProStatus == "Completed" ||
                                listRec.OppProStatus == "Sent"))
                          ? "#33BA70"
                          : listRec.AppType != 2 && listRec.ActualValue == null
                          ? //   ||
                            // (listRec.AppType == 2 &&
                            //   (listRec.OppProStatus == "Planned" ||
                            //     listRec.OppProStatus == null))
                            "#8795b1"
                          : "#00a3ff",
                      createdBy: listRec.CreatedBy,
                      isHover: false,
                      isRowBefore: false,
                      isReassigned: listRec.IsReassigned,
                      isAccepted: listRec.IsAccepted,
                      isApproved: listRec.IsApproved,
                      isRejected: listRec.IsRejected,
                      isShared: listRec.IsShared,
                      isImportant: listRec.IsImportant,
                      isFollowed: listRec.IsFollowed,
                      maxClaims: listRec.MaxClaims,
                      totalClaims: listRec.TotalClaims,
                      owner_UserId: listRec.Owner_UserId,
                      allowedActions: this._allowedActions.getAllowedActions(
                        listRec.Owner_UserId,
                        listRec.CreatedBy_UserId,
                        listRec.AppType == 1
                          ? parseInt(this.engProLoggedInUserId)
                          : parseInt(this.loggedInUserId),
                        this._utils.getActivityStatus(
                          listRec.Status,
                          listRec.ActualValue,
                          listRec.IsShared
                        ),
                        listRec.AllowedActions,
                        listRec.IsAccepted,
                        listRec.IsReassigned,
                        listRec.AppType == 1 ? true : false,
                        listRec.DueDate,
                        listRec.MaxClaims,
                        listRec.TotalClaims,
                        undefined
                      ),
                      oppProActivityType: listRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        listRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        listRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      // oppProStatus:
                      //   listRec.OppProStatus == "Cancelled"
                      //     ? "Cancelled"
                      //     : listRec.OppProStatus == "Completed" ||
                      //       listRec.OppProStatus == "Sent"
                      //     ? "Done"
                      //     : listRec.OppProStatus == "Planned" ||
                      //       listRec.OppProStatus == null
                      //     ? "Not Started"
                      //     : "In progress",
                    };
                  })
                : [];
              this.activitiesSubject.next(
                this.activitiesByGroup.groups[index].groupList
              );
              for (
                var i = 0;
                i < this.activitiesByGroup.groups[index].groupList.length;
                i++
              ) {
                this.tempGroupedActivitiesArr[index].push(
                  this.activitiesByGroup.groups[index].groupList[i]
                );
              }

              this.activitiesByGroup.groups[
                index
              ].groupList = this.tempGroupedActivitiesArr[index];

              this.isError = false;
              group.isLoadingMore = false;
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });

              this.isError = false;
              group.isLoadingMore = false;
            }
          }
        },
        (error: Error): void => {
          this.isError = true;
          group.isLoadingMore = false;
        }
      );
    }
  }

  onPageChange(ev: any, filter?: any, group?: any, index?: number) {
    if (ev.pageIndex > ev.previousPageIndex) {
      if (this.groupByAppliedFilter == StemeXeGroupType.None) {
        this.pageIndex = ev.pageIndex + 1;
      } else {
        group.pageIndex = ev.pageIndex + 1;
      }
      this.loadMore(filter, group, index);
    } else {
      if (this.groupByAppliedFilter == StemeXeGroupType.None) {
        this.pageIndex = ev.pageIndex + 1;
      } else {
        group.pageIndex = ev.pageIndex + 1;
      }
      // this.loadLess(filter, group, index);

      this.loadMore(filter, group, index);
    }
  }

  reload(ev) {
    if (ev == true) {
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
    }
  }

  reloadLists(
    search: string,
    groupByAppliedFilter: number,
    filter?: any,
    group?: any
  ) {
    filter = this.setTeamIdForScoreCardInFilter(filter);
    this.selectedFiltersIds.IsImportant = this.showImportant;
    //this.search == "" ? (this.search = null) : "";
    this.isReloadingList = true;
    this.listReloaded = false;
    this.activitiesByGroup.groups = [];
    this.activitiesByGroup.ungrouped = [];
    this.isWeekDay = !(groupByAppliedFilter == StemeXeGroupType.None);
    if (groupByAppliedFilter == StemeXeGroupType.None) {
      forkJoin([
        this._activitiesService.getAllByGroupForMine(
          search,
          groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),

        this._activitiesService.getCountForMine(
          search,
          groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        ),
        this._activitiesService.getAllByWeeksForMine(this.engProLoggedInUserId),
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.allWeekEfficiency = response[2].ResponseResult.Weeks;
            this.next = this.allWeekEfficiency[this.allWeekEfficiency.length-1].WeekName == 'This Week' ? false : true;
            this.previous = this.allWeekEfficiency[0].WeekName == 'Previous Week' ? false : true;
            this.getGraphDetailForMine();
            this.totalCount = response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            if (resp.ResponseCode == 2000) {
              this.totalCount = response[1].ResponseResult.ActivityCount;
              this.lastLoadedCount = resp.ResponseResult.Activities.length;

              if (
                !!resp.ResponseResult.WeekDays &&
                resp.ResponseResult.WeekDays != null
              ) {
                this.activitiesByGroup.weekDays = {
                  effortSum: this.calculateffortsHours(
                    resp.ResponseResult.WeekDays.EffortSum
                  ),
                  effortSumHours: Math.floor(
                    moment
                      .duration(
                        resp.ResponseResult.WeekDays.EffortSum,
                        "minutes"
                      )
                      .asHours()
                  ),
                  effortSumMinutes: Math.floor(
                    moment
                      .duration(
                        moment
                          .duration(
                            resp.ResponseResult.WeekDays.EffortSum,
                            "minutes"
                          )
                          .asHours() -
                          Math.floor(
                            moment
                              .duration(
                                resp.ResponseResult.WeekDays.EffortSum,
                                "minutes"
                              )
                              .asHours()
                          ),
                        "hours"
                      )
                      .asMinutes()
                  ),
                  days: !!resp.ResponseResult.WeekDays.Days
                    ? resp.ResponseResult.WeekDays.Days.map((dayRec) => {
                        return {
                          date: moment(dayRec.Date).format("ddd"),
                          effortSum: this.calculateffortsHours(
                            dayRec.EffortSum
                          ),

                          effortSumPercent: this.calculateffortsPercent(
                            this.calculateffortsHours(dayRec.EffortSum)
                          ),
                        };
                      })
                    : [],
                };
                this.cdRef.detectChanges();
              } else {
                this.activitiesByGroup.weekDays = null;
              }

              this.activitiesByGroup.newAssigned = !!resp.ResponseResult
                .NewAssigned
                ? resp.ResponseResult.NewAssigned.map((newAssignedRec) => {
                    return {
                      id: newAssignedRec.Id,
                      appType:
                      newAssignedRec.SourceSystemTypeId == null ? 0 : newAssignedRec.SourceSystemTypeId == 1 ? 4 : newAssignedRec.SourceSystemTypeId == 2 ? 1 : newAssignedRec.SourceSystemTypeId == 3 ? 2 : newAssignedRec.SourceSystemTypeId == 4 ? 3 : newAssignedRec.SourceSystemTypeId == 5 ? 5 : null,
                      requestId: newAssignedRec.ESP_RequestId,
                      requestName: newAssignedRec.ESP_RequestName,
                      requestNumber: newAssignedRec.ESP_RequestNumber,
                      tacticTitle: newAssignedRec.TacticTitle,
                      description: newAssignedRec.Description,
                      targetValue: newAssignedRec.TargetValue,
                      actualValue: newAssignedRec.ActualValue,
                      createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                      score: newAssignedRec.Score,
                      userOwner: newAssignedRec.UserOwner,
                      dueDate: newAssignedRec.DueDate,
                      startDate: moment(newAssignedRec.StartDate).format(
                        "DD MMM YYYY"
                      ),

                      isOverdue:
                        this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                        "Overdue"
                          ? true
                          : false,
                      effortInHour: newAssignedRec.EffortInHour,
                      effortInMinute: newAssignedRec.EffortInMinute,
                      effortSum: newAssignedRec.EffortSum,
                      unit: newAssignedRec.Unit,
                      parentBoardId: newAssignedRec.ParentBoardId,
                      parentBoardName: newAssignedRec.ParentBoardName,
                      status: newAssignedRec.Status,
                      createdBy: newAssignedRec.CreatedBy,
                      owner: newAssignedRec.UserOwner,
                      isHover: false,
                      isRowBefore: false,
                      isReassigned: newAssignedRec.IsReassigned,
                      isRejected: newAssignedRec.IsRejected,
                      isShared: newAssignedRec.IsShared,
                      isImportant: newAssignedRec.IsImportant,
                      isFollowed: newAssignedRec.IsFollowed,
                      maxClaims: newAssignedRec.MaxClaims,
                      totalClaims: newAssignedRec.TotalClaims,
                      oppProActivityType: newAssignedRec.OppProActivityType,

                      oppProScheduleEndDate: moment(
                        newAssignedRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        newAssignedRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      // oppProStatus:
                      //   newAssignedRec.OppProStatus == "Cancelled"
                      //     ? "Cancelled"
                      //     : newAssignedRec.OppProStatus == "Completed" ||
                      //       newAssignedRec.OppProStatus == "Sent"
                      //     ? "Done"
                      //     : newAssignedRec.OppProStatus == "Planned" ||
                      //       newAssignedRec.OppProStatus == null
                      //     ? "Not Started"
                      //     : "In progress",
                    };
                  })
                : [];

              this.activitiesByGroup.ungrouped = !!resp.ResponseResult
                .Activities
                ? resp.ResponseResult.Activities.map((ungroupedRec) => {
                    return {
                      id:
                        ungroupedRec.AppType == 3
                          ? ungroupedRec.EpmInfo.TaskId
                          : ungroupedRec.Id,
                      epmInfo: ungroupedRec.EpmInfo,
                      appType:
                      ungroupedRec.SourceSystemTypeId == null ? 0 : ungroupedRec.SourceSystemTypeId == 1 ? 4 : ungroupedRec.SourceSystemTypeId == 2 ? 1 : ungroupedRec.SourceSystemTypeId == 3 ? 2 : ungroupedRec.SourceSystemTypeId == 4 ? 3 : ungroupedRec.SourceSystemTypeId == 5 ? 5 : null,
                      requestId: ungroupedRec.ESP_RequestId,
                      requestName: ungroupedRec.ESP_RequestName,
                      requestNumber: ungroupedRec.ESP_RequestNumber,
                      tacticTitle: ungroupedRec.TacticTitle,
                      description: ungroupedRec.Description,
                      name: ungroupedRec.Description,
                      targetValue: ungroupedRec.TargetValue,
                      actualValue: ungroupedRec.ActualValue,
                      createdBy_UserId: ungroupedRec.CreatedBy_UserId,
                      score: ungroupedRec.Score,
                      userOwner: ungroupedRec.UserOwner,
                      dueDateLabel: this._utils.getDueDateLabel(
                        ungroupedRec.DueDate
                      ),
                      // dueDate:
                      //   this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                      //   "Overdue"
                      //     ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                      //     : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                      //       "Due Today"
                      //     ? "Today"
                      //     : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),

                      dueDate:
                        this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                        "Overdue"
                          ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                          : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                            "Due Today"
                            ? (!this.isArabic ? "Today" : "اليوم")
                            : ungroupedRec.DueDate,
                      startDate: moment(ungroupedRec.StartDate).format(
                        "DD MMM YYYY"
                      ),
                      effortInHour: ungroupedRec.EffortInHour,
                      effortInMinute: ungroupedRec.EffortInMinute,
                      effortSum: ungroupedRec.EffortSum,
                      unit: ungroupedRec.Unit,
                      parentBoardId: ungroupedRec.ParentBoardId,
                      parentBoardName: ungroupedRec.ParentBoardName,
                      status: ungroupedRec.Status,
                      progressStatus: ungroupedRec.IsRejected
                        ? "Rejected"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 4 &&
                            !ungroupedRec.IsReassigned) ||
                          (ungroupedRec.AppType == 2 &&
                            ungroupedRec.OppProStatus == "Cancelled")
                        ? "Cancelled"
                        : ungroupedRec.AppType != 2 &&
                          ungroupedRec.Status == 4 &&
                          ungroupedRec.IsReassigned
                        ? "Reassigned"
                        : (ungroupedRec.AppType != 2 &&
                            ungroupedRec.Status == 2) ||
                          (ungroupedRec.AppType == 2 &&
                            (ungroupedRec.OppProStatus == "Completed" ||
                              ungroupedRec.OppProStatus == "Sent"))
                        ? "Done"
                        : ungroupedRec.ActualValue == null &&
                          ungroupedRec.AppType != 2
                        ? "Not Started"
                        : ungroupedRec.AppType == 2 &&
                          (ungroupedRec.OppProStatus == "Planned" ||
                            ungroupedRec.OppProStatus == null)
                        ? "Planned"
                        : "In progress",
                      progressStatusColor:
                        ungroupedRec.AppType != 2 && ungroupedRec.IsRejected
                          ? "#EB487F"
                          : (ungroupedRec.AppType != 2 &&
                              ungroupedRec.Status == 4) ||
                            (ungroupedRec.AppType == 2 &&
                              ungroupedRec.OppProStatus == "Cancelled")
                          ? "#EB487F"
                          : (ungroupedRec.AppType != 2 &&
                              ungroupedRec.Status == 2) ||
                            (ungroupedRec.AppType == 2 &&
                              (ungroupedRec.OppProStatus == "Completed" ||
                                ungroupedRec.OppProStatus == "Sent"))
                          ? "#33BA70"
                          : ungroupedRec.AppType != 2 &&
                            ungroupedRec.ActualValue == null
                          ? //   ||
                            // (ungroupedRec.AppType == 2 &&
                            //   (ungroupedRec.OppProStatus == "Planned" ||
                            //     ungroupedRec.OppProStatus == null))
                            "#8795b1"
                          : "#00a3ff",
                      createdBy: ungroupedRec.CreatedBy,

                      isHover: false,
                      isRowBefore: false,
                      isReassigned: ungroupedRec.IsReassigned,
                      isAccepted: ungroupedRec.IsAccepted,
                      isApproved: ungroupedRec.IsApproved,
                      isRejected: ungroupedRec.IsRejected,
                      isShared: ungroupedRec.IsShared,
                      isImportant: ungroupedRec.IsImportant,
                      isFollowed: ungroupedRec.IsFollowed,
                      maxClaims: ungroupedRec.MaxClaims,
                      totalClaims: ungroupedRec.TotalClaims,
                      owner_UserId: ungroupedRec.Owner_UserId,
                      allowedActions: this._allowedActions.getAllowedActions(
                        ungroupedRec.Owner_UserId,
                        ungroupedRec.CreatedBy_UserId,
                        ungroupedRec.AppType == 1
                          ? parseInt(this.engProLoggedInUserId)
                          : parseInt(this.loggedInUserId),
                        this._utils.getActivityStatus(
                          ungroupedRec.Status,
                          ungroupedRec.ActualValue,
                          ungroupedRec.IsShared
                        ),
                        ungroupedRec.AllowedActions,
                        ungroupedRec.IsAccepted,
                        ungroupedRec.IsReassigned,
                        ungroupedRec.AppType == 1 ? true : false,
                        ungroupedRec.DueDate,
                        ungroupedRec.MaxClaims,
                        ungroupedRec.TotalClaims,
                        undefined
                      ),
                      oppProActivityType: ungroupedRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        ungroupedRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        ungroupedRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      // oppProStatus:
                      //   ungroupedRec.OppProStatus == "Cancelled"
                      //     ? "Cancelled"
                      //     : ungroupedRec.OppProStatus == "Completed" ||
                      //       ungroupedRec.OppProStatus == "Sent"
                      //     ? "Done"
                      //     : ungroupedRec.OppProStatus == "Planned" ||
                      //       ungroupedRec.OppProStatus == null
                      //     ? "Not Started"
                      //     : "In progress",
                    };
                  })
                : [];

              if (this.isFiltersDialogOpened) {
                setTimeout(() => {
                  this.isFiltersDialogOpened = false;
                }, 500);
              }
              this.listReloaded = true;
              this.isReloadingList = false;
              this.isError = false;
              //if(this.pageIndex ==1){
              setTimeout(() => {
                this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
              }, 500);
              // }else{
              //   this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
              // }
            } else {
              this.isReloadingList = false;
              this.isError = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.listReloaded = true;
          this.isReloadingList = false;
          this.isError = true;
        }
      );
    } else {
      this._activitiesService
        .getAllGroupsForMine(
          search,
          groupByAppliedFilter,
          filter,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        )
        .subscribe(
          (resp) => {
            if (!!resp) {
              if (resp.ResponseCode == 2000) {
                this.isWeekView = groupByAppliedFilter == 3 ? true : false;
                this.activitiesByGroup.groups = resp.ResponseResult.Groups.map(
                  (groupRec) => {
                    return {
                      groupId: groupRec.Id,
                      groupName: groupRec.Name,
                      groupCount: groupRec.Count,
                      startDate: groupRec.StartDate,
                      endDate: groupRec.EndDate,
                      subType: groupRec.SubType,
                      groupList: [],
                      isGroupExpanded: false,
                      isGroupActivitiesLoading: false,
                      pageIndex: 1,
                      isAllActivitiesLoaded: groupRec.Count == 0 ? true : false,
                      isLoadingMore: false,
                      lastLoadedCount: 0,
                    };
                  }
                );

                this.listReloaded = true;
                this.isReloadingList = false;
                this.isError = false;
              } else {
                this.isReloadingList = false;
                this.isError = false;
                this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                  timeout: 3000,
                });
              }
            }
          },
          (error: Error): void => {
            this.listReloaded = true;
            this.isReloadingList = false;
            this.isError = true;
          }
        );
    }
  }

  reloadGraphs() {
    this.isReloadingList = true;
    this.listReloaded = false;
    // this.activitiesByGroup.groups = [];
    // this.activitiesByGroup.ungrouped = [];
    this._activitiesService
      .getAllByWeeksForMine(this.engProLoggedInUserId)
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.activitiesByGroup.weeksGroup = {
                allowedActions: resp.ResponseResult.AllowedActions,
                weeks: resp.ResponseResult.Weeks.map((week) => {
                  return {
                    effortSum: week.EffortSum,
                    effortSumHours: Math.floor(
                      moment.duration(week.EffortSum, "minutes").asHours()
                    ),
                    effortSumMinutes: Math.floor(
                      moment
                        .duration(
                          moment.duration(week.EffortSum, "minutes").asHours() -
                            Math.floor(
                              moment
                                .duration(week.EffortSum, "minutes")
                                .asHours()
                            ),
                          "hours"
                        )
                        .asMinutes()
                    ),
                    indicatorCount: week.IndicatorCount,
                    overdueCount: week.OverdueCount,
                    indicators: week.Indicators.map((indicator) => {
                      return {
                        count: indicator.Count,
                        dueDate: indicator.DueDate,
                      };
                    }),
                    weekEndDate: week.WeekEndDate,
                    weekStartDate: week.WeekStartDate,
                    weekEndDateStr: moment(week.WeekEndDate).format("D MMM"),
                    weekStartDateStr: moment(week.WeekStartDate).format(
                      "D MMM"
                    ),
                    weekName: week.WeekName,
                    weekNumber: week.WeekNumber,
                  };
                }),
              };

              this.listReloaded = true;
              this.isReloadingList = false;
              this.isError = false;
              var scrollToThisWeek = false;
              if (this.activitiesByGroup.weeksGroup.weeks.length > 0) {
                for (
                  var i = 0;
                  i < this.activitiesByGroup.weeksGroup.weeks.length;
                  i++
                ) {
                  if (
                    this.activitiesByGroup.weeksGroup.weeks.length > 1 &&
                    this.activitiesByGroup.weeksGroup.weeks[i].weekName ==
                      "This Week"
                  ) {
                    scrollToThisWeek = true;
                  }
                }
              }
              if (scrollToThisWeek) {
                setTimeout(() => {
                  this.scrollToThisWeek("week-This Week");
                }, 300);
              }
            } else {
              this.isReloadingList = false;
              this.isError = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.listReloaded = true;
          this.isReloadingList = false;

          this.isError = true;
        }
      );
  }

  calculateffortsHours(effortInMinute: number) {
    let actualWorkingHours = Math.floor(
      moment.duration(effortInMinute, "minutes").asHours()
    );
    if (actualWorkingHours > 19) {
      return 19;
    } else {
      return actualWorkingHours;
    }
  }

  calculateffortsPercent(effortInHour: number) {
    let Percent = 0;
    if (effortInHour >= 8) {
      Percent = 100;
    } else {
      Percent = effortInHour * 10;
    }
    return Percent;
  }

  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
    //this.isFilterApplied = false;
    if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
      if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
        if (this.isSearchMode()) {
          this.isListViewActive = true;
          this.selectedFiltersIds.IsImportant = this.showImportant;
          this.reloadLists(
            this.search,
            StemeXeGroupType.None,
            this.selectedFiltersIds
          );
        } else {
          this.isListViewActive = false;
          this.reloadGraphs();
        }
      }
    } else {
      this.selectedFiltersIds.IsImportant = this.showImportant;
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
    }
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

  applyGrouping(option: { id: number; name: string }) {
    // if (option.id == StemeXeGroupType.None) {
    //   this.graphTitle = "Today's Efficiency";
    //   this.graphSubTitle = this.getSubtitle(
    //     this.graphData.EffortSumToday,
    //     this.graphData.OverdueCountToday,
    //     this.graphData.OpenCountToday
    //   );
    // } else {
    //   this.graphSubTitle = this.getSubtitle(
    //     this.graphData.EffortSum,
    //     this.graphData.OverdueCount,
    //     this.graphData.OpenCount
    //   );
    // }
    this.resetToDefualt();
    this.groupByAppliedFilter = option.id;
    if (option.id == StemeXeGroupType.Graph) {
      this.isListViewActive = false;
      this.reloadGraphs();
    } else {
      this.isListViewActive = true;
      this.selectedFiltersIds.IsImportant = this.showImportant;
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
    }
  }

  showOptions(event:MatCheckboxChange) {
    this.selectedFiltersIds.IsImportant = event.checked;
    this.isListViewActive = true;
    this.selectedFiltersIds.IsImportant = this.showImportant;
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
  }

  openActivityDetails(row: Activity) {
    let queryParams = {
      queryParams: {
        accessedFrom: "list",
        preTab: StemeXeListType.Mine,
        fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      },
    };
    if (row.appType == 3) {
      this._router.navigate(
        [
          `pages/activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`,
        ],
        queryParams
      );
    } else if (row.appType == 2) {
      this._router.navigate(
        [`pages/activities/details/oppProAct/${row.id}`],
        queryParams
      );
    } else if (row.appType == 1) {
      this._router.navigate(
        [`pages/activities/details/engProAct/${row.id}`],
        queryParams
      );
    } else {
      this._router.navigate(
        [`pages/activities/details/${row.id}`],
        queryParams
      );
    }
  }

  openEPMSettingsDialog(): void {
    const dialogRef = this._dialog.open(EpmSettingsDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        isEpmConnected: this.isEpmConnected,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isEpmConnected = result;
      if(!!result) {
        this.selectedFiltersIds.IsImportant = this.showImportant;
        this.reloadLists(
          this.search,
          this.groupByAppliedFilter,
          this.selectedFiltersIds
        );
      }
    });
  }

  resetToDefualt() {
    this.selectedFiltersIds = {
      IsFollowed: true,
      IsImportant: false,
      StatusIds: [6, 5],
    };
    this.pageIndex = 1;
    this.pageSize = 10; //this.size != "XS" && this.size != "SM" ? 10000 : 10;
    this.tempUngroupedActivitiesArr = [];
    this.search = null;
    this.lastLoadedCount = 0;
  }

  openFiltersDialog(): void {
    this.isFiltersDialogOpened = true;
    this.resetToDefualt();

    const dialogRef = this._dialog.open(FiltersDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: "80vh",
      data: {
        type: this.activeTab,
        selected: this.selectedFilters,
        engProData: {
          isEngProEnabled: this.isEngProEnabled,
          engProLoggedInUserId: this.engProLoggedInUserId,
          engProUsers: this.engProUsers,
          engProTeams: this.engProTeams,
        },
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.selectedFiltersIds = result.ids;
        this.selectedFilters = result.objs.length > 0 ? result.objs : [];
        this.isDefultFilterApplied = result.isDefault;
        this.selectedFiltersIds.IsImportant = this.showImportant;
        this.reloadLists(this.search, this.groupByAppliedFilter, result.ids);
      } else {
        // this.reloadLists(
        //   this.search,
        //   this.groupByAppliedFilter,
        //   this.selectedFiltersIds
        // );
      }
    });
  }

  onFilterClose(filter) {
    this.removeSelectedItems(filter);
    this.selectedFiltersIds.IsImportant = this.showImportant;
    this.reloadLists(
      this.search,
      this.groupByAppliedFilter,
      this.selectedFiltersIds
    );
  }

  removeSelectedItems(filter) {
    if (!!this.selectedFilters && this.selectedFilters.length > 0) {
      for (var i = 0; i < this.selectedFilters.length; i++) {
        switch (this.selectedFilters[i].type) {
          case "assignor":
            for (
              var j = 0;
              j < this.selectedFiltersIds.CreatorIds.length;
              j++
            ) {
              this.selectedFiltersIds.CreatorIds = this.selectedFiltersIds.CreatorIds.filter(
                (selectedFilter) => selectedFilter !== filter.id
              );
            }
            break;
          case "team":
            for (var j = 0; j < this.selectedFiltersIds.TeamIds.length; j++) {
              this.selectedFiltersIds.TeamIds = this.selectedFiltersIds.TeamIds.filter(
                (selectedFilter) => selectedFilter !== filter.id
              );
            }
            break;
          case "tactic":
            for (var j = 0; j < this.selectedFiltersIds.TacticIds.length; j++) {
              this.selectedFiltersIds.TacticIds = this.selectedFiltersIds.TacticIds.filter(
                (selectedFilter) => selectedFilter !== filter.id
              );
            }
            break;
          case "priority":
            this.selectedFiltersIds.IsImportant = false;
            break;
          case "following":
            this.selectedFiltersIds.IsFollowed = false;
            break;
          case "dueDate":
            this.selectedFiltersIds.DueDate = null;
            break;
          default:
            for (var j = 0; j < this.selectedFiltersIds.StatusIds.length; j++) {
              this.selectedFiltersIds.StatusIds = this.selectedFiltersIds.StatusIds.filter(
                (selectedFilter) => selectedFilter !== filter.id
              );
            }
            break;
        }
      }
      this.selectedFilters = this.selectedFilters.filter(
        (selectedFilter) => selectedFilter.id !== filter.id
      );
    }
  }
  onClearFilterS() {
    this.selectedFilters = [];
    this.isDefultFilterApplied = true;
    this.selectedFiltersIds.IsImportant = this.showImportant;
    this.reloadLists(this.search, this.groupByAppliedFilter);
  }
  openCreateDialog(formMode: string, formType: string): void {
    this.resetToDefualt();

    if (formType == "task" && !this.isOppProEnabled) {
      const dialogRef = this._dialog.open(ActivityDialog, {
        width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
        // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
        maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
        maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
        data: {
          isMine: true,
          formMode: formMode,
          engProData: {
            isEngProEnabled: this.isEngProEnabled,
            engProLoggedInUserId: this.engProLoggedInUserId,
            engProUsers: this.engProUsers,
            engProTeams: this.engProTeams,
          },
          espAddon: this.espAddon,
          isEspEnabled: this.isEspEnabled,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if(!!result) {
          if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
            this.reloadGraphs();
          } else {
            this.selectedFiltersIds.IsImportant = this.showImportant;
            this.reloadLists(
              this.search,
              this.groupByAppliedFilter,
              this.selectedFiltersIds
            );
          }
        }
      });
    } else {
      this._activitiesService
        .getUserInfoForStemexe(this.oppProData)
        .subscribe((resp) => {
          if (!!resp) {
            if (formType == "task") {
              const dialogRef = this._dialog.open(ActivityDialog, {
                width:
                  this.size == "XS" || this.size == "SM" ? "100%" : "744px",
                // height:
                //   this.size == "XS" || this.size == "SM" ? "100%" : "520px",
                maxWidth:
                  this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
                maxHeight:
                  this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
                data: {
                  isMine: true,
                  formMode: formMode,
                  engProData: {
                    isEngProEnabled: this.isEngProEnabled,
                    engProLoggedInUserId: this.engProLoggedInUserId,
                    engProUsers: this.engProUsers,
                    engProTeams: this.engProTeams,
                  },
                  oppProData: {
                    isOppProEnabled: this.isOppProEnabled,
                    user: resp.result,
                    accessToken: this.oppProData.access_token,
                  },
                  espAddon: this.espAddon,
                  isEspEnabled: this.isEspEnabled,
                },
              });
              dialogRef.afterClosed().subscribe((result) => {
                if(!!result) {
                  if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
                    this.reloadGraphs();
                  } else {
                    this.selectedFiltersIds.IsImportant = this.showImportant;
                    this.reloadLists(
                      this.search,
                      this.groupByAppliedFilter,
                      this.selectedFiltersIds
                    );
                  }
                }
              });
            } else {
              const dialogRef = this._dialog.open(OppProDialog, {
                width:
                  this.size == "XS" || this.size == "SM" ? "100%" : "744px",
                height:
                  this.size == "XS" || this.size == "SM" ? "100%" : "520px",
                maxWidth:
                  this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
                maxHeight:
                  this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
                data: {
                  formType: formType,
                  formMode: formMode,
                  oppProData: {
                    isOppProEnabled: this.isOppProEnabled,
                    user: resp.result,
                    accessToken: this.oppProData.access_token,
                  },
                },
              });
              dialogRef.afterClosed().subscribe((result) => {
                if(!!result) {
                  if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
                    this.reloadGraphs();
                  } else {
                    this.selectedFiltersIds.IsImportant = this.showImportant;
                    this.reloadLists(
                      this.search,
                      this.groupByAppliedFilter,
                      this.selectedFiltersIds
                    );
                  }
                }
              });
            }
          }
        });
    }
  }

  addActivityToMine(event) {
    if (this.groupByAppliedFilter == StemeXeGroupType.Graph) {
      this.reloadGraphs();
    } else {
      this.selectedFiltersIds.IsImportant = this.showImportant;
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
    }
  }

  scrollToThisWeek(thisWeekId) {
    const elmnt = document.getElementById(thisWeekId) ? document.getElementById(thisWeekId).previousSibling as HTMLElement : "";
    if(elmnt) elmnt.scrollIntoView({ behavior: "smooth" });
  }
  dayHeaderClicked(evn) {
    let d = new Date();
    if (d.getDate() == evn.day.date.getDate()) {
      this.isDashboardClicked=false;
      this.overDue = this.graphData.OverdueCountToday;
      this.open = this.graphData.OpenCountToday;
      this.close = this.graphData.ClosedCountToday;
      this.graphSubTitle = this.getSubtitle(
        this.graphData.EffortSumToday,
        this.graphData.OverdueCountToday,
        this.graphData.OpenCountToday
      );
      this.graphTitle = "Today's Efficiency";
      this.arabicTitle = "كفاءة اليوم";
    }
  }

  getGraphDetailForMine() {
    this.isWeekLoading = true;
    this._activitiesService
      .GetCurrentWeekForMine(this.engProLoggedInUserId)
      .subscribe(
        (response) => {
          if (!!response) {
            if (response.ResponseCode === 2000) {
              this.reloadGraphs();
              this.isWeekLoading = false;
              this.graphData = response.ResponseResult.Week;
              this.graphData["EffortSumHr"] = this.convertNumToTime(this.graphData?.EffortSum, true);
              this.graphData["EffortSumMin"] = this.convertNumToTime(this.graphData?.EffortSum, false);
              this.graphData["EffortSumTodayHr"] = this.convertNumToTime(this.graphData?.EffortSumToday, true);
              this.graphData["EffortSumTodayMin"] = this.convertNumToTime(this.graphData?.EffortSumToday, false);
              if (!this.isDashboardClicked) {
                this.overDue = this.graphData.OverdueCountToday;
                this.open = this.graphData.OpenCountToday;
                this.close = this.graphData.ClosedCountToday;
                this.graphSubTitle = this.getSubtitle(
                  this.graphData.EffortSumToday,
                  this.graphData.OverdueCountToday,
                  this.graphData.OpenCountToday
                );
              } else {
                this.graphSubTitle = this.getSubtitle(
                  this.graphData.EffortSum,
                  this.graphData.OverdueCount,
                  this.graphData.OpenCount
                );
                this.overDue = this.graphData.OverdueCount;
                this.open = this.graphData.OpenCount
                this.close = this.graphData.ClosedCount;
              }
              this.indicators = response.ResponseResult.Week.Indicators;
              this.cdRef.detectChanges();
            } else {
              this._alertService.error(!this.isArabic ? response.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error) => {
          console.log("error", error);
        }
      );
  }
  selectedGroup(group) {
    //this.graphTitle = group.groupName;
  }

  convertNumToTime(num, isHr) {
    let time = 0;
    // Check sign of given number
    if (num > 0) {
      var hours = Math.floor(num / 60);
      let minutes = num % 60;
      //time = hours + "h " + minutes + "m";
      time = isHr ? hours : minutes;
    }
    return time;
  }

  getSubtitle(effort, overdue, open) {
    effort = effort / 60;
    let subTitle = "";
    if (effort == 0) {
      subTitle = !this.isArabic ? "Very little got done today!" : "تم إنجاز القليل جداً اليوم!";
    } else if (effort < 5) {
      subTitle = !this.isArabic ? "You can do better!" : "يمكنك القيام به على نحو أفضل!";
    } else if (effort >= 5 && effort <= 7) {
      subTitle = !this.isArabic ? "A bit more to go!" : "أكثر قليلاً للإنجاز!";
    } else if (effort > 7) {
      subTitle = !this.isArabic ? "Good job today, keep it up!" : "عمل جيد اليوم، إستمر!";
    }

    if (overdue != 0 && open != 0) {
      subTitle = subTitle + (!this.isArabic ? " Close more activities." : "إغلاق المزيد من الأنشطة!");
    }
    return subTitle;
  }

  onDashboardClick() {
    if (!this.isDashboardClicked) {
      this.graphSubTitle = this.getSubtitle(
        this.graphData.EffortSum,
        this.graphData.OverdueCount,
        this.graphData.OpenCount
      );
      this.overDue = this.graphData.OverdueCount;
      this.open = this.graphData.OpenCount;
      this.close = this.graphData.ClosedCount;
      let currentWeek = this.allWeekEfficiency.filter(
        (week) => week.WeekName == this.graphData.WeekName
      );
      if (currentWeek.length == 0) {
        this.allWeekEfficiency.push(this.graphData);
        this.allWeekEfficiency.sort(
          (a, b) =>
            new Date(a.WeekStartDate).getTime() -
            new Date(b.WeekStartDate).getTime()
        );
      }
      this.isDashboardClicked = true;
      this.isWeekDay = true;
      this.next = true;
      this.previous = true;
      this.allWeekEfficiency.map((week) => {
        if(this.isArabic) {
          moment.locale('ar');
          week.WeekStartDateStr = moment(week.WeekStartDate).format("D MMM");
          week.WeekEndDateStr = moment(week.WeekEndDate).format("D MMM");
          week["arabicTitle"] = `${week.WeekStartDateStr} - ${week.WeekEndDateStr}`
        }
          moment.locale('en');
          week.WeekStartDateStr = moment(week.WeekStartDate).format("D MMM");
          week.WeekEndDateStr = moment(week.WeekEndDate).format("D MMM");
        if (week.WeekName == "This Week" || week.WeekStartDate==this.graphData.WeekStartDate) {
          week.WeekName = `${week.WeekStartDateStr} - ${week.WeekEndDateStr}`;
          this.graphTitle = week.WeekName;
          this.arabicTitle = week.arabicTitle;
        } else if (week.WeekName == "Previous Week") {
          week.WeekName = `${week.WeekStartDateStr} - ${week.WeekEndDateStr}`;
        }
      });
    }
  }

  onChangeWeek(type: string) {
    this.onDashboardClick();
    let data = true;
    this.isWeekLoading = true;
    this.allWeekEfficiency.map((weeks, idx) => {
      if (this.graphTitle == weeks.WeekName && data) {
        data = false;
        if (type == "next") {
          this.previous = true;
          if (idx == this.allWeekEfficiency.length - 2) {
            this.next = false;
            this.cdRef.detectChanges();
            // return;
          }
          const week = this.allWeekEfficiency[idx + 1];
          this.graphData = week;
          this.graphData["EffortSumHr"] = this.convertNumToTime(this.graphData?.EffortSum, true);
          this.graphData["EffortSumMin"] = this.convertNumToTime(this.graphData?.EffortSum, false);
          this.graphData["EffortSumTodayHr"] = this.convertNumToTime(this.graphData?.EffortSumToday, true);
          this.graphData["EffortSumTodayMin"] = this.convertNumToTime(this.graphData?.EffortSumToday, false);
          this.graphSubTitle = this.getSubtitle(
            this.graphData.EffortSum,
            this.graphData.OverdueCount,
            this.graphData.OpenCount
          );
          this.overDue = this.graphData.OverdueCount;
          this.open = this.graphData.OpenCount;
          this.close = this.graphData.ClosedCount;
          this.indicators = week.Indicators;
          this.graphTitle = week.WeekName;
          this.arabicTitle = week.arabicTitle;
          this.cdRef.detectChanges();
        } else if (type == "previous") {
          this.next = true;
          data = false;
          if (idx == 1) {
            this.previous = false;
            this.cdRef.detectChanges();
            // return;
          }
          const week = this.allWeekEfficiency[idx - 1];
          this.graphData = week;
          this.graphData["EffortSumHr"] = this.convertNumToTime(this.graphData?.EffortSum, true);
          this.graphData["EffortSumMin"] = this.convertNumToTime(this.graphData?.EffortSum, false);
          this.graphData["EffortSumTodayHr"] = this.convertNumToTime(this.graphData?.EffortSumToday, true);
          this.graphData["EffortSumTodayMin"] = this.convertNumToTime(this.graphData?.EffortSumToday, false);
          this.graphSubTitle = this.getSubtitle(
            this.graphData.EffortSum,
            this.graphData.OverdueCount,
            this.graphData.OpenCount
          );
          this.overDue = this.graphData.OverdueCount;
          this.open = this.graphData.OpenCount;
          this.close = this.graphData.ClosedCount;
          this.indicators = week.Indicators;
          this.graphTitle = week.WeekName;
          this.arabicTitle = week.arabicTitle;
          this.cdRef.detectChanges();
        }
      }
    });
    this.isWeekLoading = false;
  }

  setTeamIdForScoreCardInFilter(filter) {
    console.log("test 123 ")
    if(this.fromTab == 'ScoreCard' && this.teamId != 0) {
      if(filter) {
        filter["TeamIds"] = [this.teamId];
      } else {
        let fill:any = {
          TeamIds: []
        };
        fill["TeamIds"] = [this.teamId];
        filter = fill;
      }
    }
    return filter;
  }
}
