import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { ActivitiesByGroup } from "../../../../activity/models/activities-by-group";
import { StemeXeGroupType, StemeXeListType } from "../../../../activity/enums";
import * as moment from "moment";
import { ActivitiesService } from "../../../../activity/services/activities.service";
import { ActivityResizeService } from "../../../../shared/services/resize-activity.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ActivityUtilsService } from "../../../../shared/utils-activity.service";
// import { SimplestrataAuthService } from "../../../../shared/services/simplestrata-auth-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../../shared/shared-activity.enums";
import { FiltersDialog } from "../../../../activity/dialogs/filters-dialog/filters-dialog";
import { MatDialog } from "@angular/material/dialog";
import { Activity } from "../../../../activity/models/activity";
import { forkJoin, Subject } from 'rxjs';
import { AllowedActionsService } from '../../../../activity/services/allowed-actions.service';
import { ActivityAlertService } from "../../../../shared/alert/alert-activity.service";
import { SimplestrataAuthService } from "src/app/activities/shared/services/simplestrata-auth.service";
// import { SimplestrataAuthService } from "src/app/shared/services/simplestrata-auth.service";

@Component({
  selector: 'xcdrs-shared-activities',
  templateUrl: './shared-activities.component.html',
  styleUrls: ['./shared-activities.component.scss']
})
export class SharedActivitiesComponent implements OnInit {

  isLoading: boolean = false;
  isReloadingList: boolean = false;
  listReloaded: boolean = false;
  isError: boolean = false;
  isFirstRow: boolean = false;
  isFirstRowInGroup: Array<boolean> = [];
  activitiesByGroup: ActivitiesByGroup = new ActivitiesByGroup();
  search: string = '';
  dataLoaded: boolean = false;
  isDefultFilterApplied: boolean = true;
  groupByAppliedFilter: number = StemeXeGroupType.None;
  groupByOptions: { id: number; name: string }[] = [
    { id: StemeXeGroupType.None, name: "None" },
    { id: StemeXeGroupType.DueDate, name: "By Due Dates" },
    { id: StemeXeGroupType.Project, name: "By Boards" },
    { id: StemeXeGroupType.Week, name: "By Weeks" },
    { id: StemeXeGroupType.Graph, name: "By Graphical view" },
  ];
  size: string;
  userId: string;
  loggedInUserId: any;
  selectedFiltersIds: any = {
    IsFollowed: true,
    // IsImportant: false,
    StatusIds: [6, 5],
  };
  selectedFilters: Array<any> = [];
  isEngProEnabled: boolean = false;
  isEngProDataLoaded: boolean = false;
  engProLoggedInUserId: any = null;
  isEngProActivity: boolean = false;
  isListViewActive: boolean = true;
  isLoadingMore: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;//10000;
  totalCount:number=0;
  lastLoadedCount:number=0;
  isAllUngroupedActivitiesLoaded: boolean = false;
  tempUngroupedActivitiesArr: Array<any> = new Array();
  tempGroupedActivitiesArr: Array<any> = new Array();
  isAllGroupActivitiesLoaded: Array<boolean> = new Array();
  @ViewChild("scrollableContainer")
  scrollableContainer: ElementRef;
  activitiesSubject: Subject<Activity[]> = new Subject<Activity[]>();
  activeTab: number = StemeXeListType.Shared;
  isFiltersDialogOpened: boolean = false;
  isPageRendering = true;
  isArabic:boolean = false;
  SourceSystemId: any = null;
  SourceTenantId:any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  constructor(
    private _activitiesService: ActivitiesService,
    private _resizeService: ActivityResizeService,
    private _router: Router,
    private _utils: ActivityUtilsService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _alertService: ActivityAlertService,
    private _actRoute: ActivatedRoute,
    public _dialog: MatDialog,
    private _allowedActions: AllowedActionsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {


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
    })


    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];

      if (this.size == "XS" || this.size == "SM") {
        this.pageSize = 10;
      }

      this.search = null;
    });
    this.isEngProActivity = !!this._actRoute.snapshot.params.activityType
      ? true
      : false;
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (!this.isPageRendering && !this.isFiltersDialogOpened) {
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
          }
        }
      }
    }
  }


  ngOnInit(): void {
    this.getLanguage();
    this._actRoute.data.subscribe((data) => {
      if (!!data) {
        if (!!data.engProData) {
          // data.engProData.subscribe((data) => {
          if (data.engProData.code == "001" && !!data.engProData.result) {
            this.engProLoggedInUserId = data.engProData.result.userId;
            this.isEngProEnabled = true;
          }

          this.loadAllSharedActivities(this.selectedFiltersIds);
          this.isEngProDataLoaded = true;
          //  });
        }
        this.loadAllSharedActivities(this.selectedFiltersIds);
        this.isEngProDataLoaded = true;
      } else {
        this.loadAllSharedActivities(this.selectedFiltersIds);
        this.isEngProDataLoaded = true;
      }
    });
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }


  loadAllSharedActivities(filter?: any) {
    this.isPageRendering = false;
    this.search == "" ? (this.search = null) : "";
    this.isLoading = true;
    filter = this.setTeamIdForScoreCardInFilter(filter);
    forkJoin([
    this._activitiesService
      .getAllShared(
        this.search,
        this.groupByAppliedFilter,
        this.pageSize,
        this.pageIndex,
        undefined,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId,
        this.isEngProActivity
      ),
      this._activitiesService
      .getCountForShared(
        this.search,
        this.groupByAppliedFilter,
        this.pageSize,
        this.pageIndex,
        undefined,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
    ]).subscribe(
      (response) => {
        if (!!response) {
          this.totalCount =response[1].ResponseResult.ActivityCount;
          let resp = response[0];
            if (resp.ResponseCode == 2000) {
              
              let preURL = '/pages/activities/f';//localStorage.getItem('preURL');
              this.lastLoadedCount = resp.ResponseResult.Activities.length;

              this.activitiesByGroup.ungrouped = !!resp.ResponseResult
                .Activities
                ? resp.ResponseResult.Activities.map((listRec) => {
                    return {
                      id: listRec.Id,            
                      // appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
                      appType : listRec.SourceSystemTypeId == null ? 0 : listRec.SourceSystemTypeId == 1 ? 4 : listRec.SourceSystemTypeId == 2 ? 1 : listRec.SourceSystemTypeId == 3 ? 2 : listRec.SourceSystemTypeId == 4 ? 3 : null,
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
                      dueDateLabel: this._utils.getDueDateLabel(
                        listRec.DueDate
                      ),
                      dueDate:
                        this._utils.getDueDateLabel(listRec.DueDate) ==
                        "Overdue"
                          ? this._utils.getDueDateTimeAgo(listRec.DueDate)
                          : this._utils.getDueDateLabel(listRec.DueDate) ==
                            "Due Today"
                          ? "Today"
                          : moment(listRec.DueDate).format("DD MMM YYYY"),
                      effortInHour: listRec.EffortInHour,
                      effortInMinute: listRec.EffortInMinute,
                      effortSum: listRec.EffortSum,
                      unit: listRec.Unit,
                      parentBoardId: listRec.ParentBoardId,
                      parentBoardName: listRec.ParentBoardName,
                      status: listRec.Status,
                      progressStatus: 
                        listRec.Status == 4 
                        ? "Cancelled"
                        : listRec.Status == 2
                        ? "Done"
                        : listRec.TotalClaims == 0 && listRec.Status != 2  && listRec.Status != 4 
                        ? "Not Started"
                        : "In progress",
                      progressStatusColor:
                       listRec.Status == 4
                          ? "#EB487F"
                          :listRec.Status == 2
                          ? "#33BA70"
                          : listRec.TotalClaims == 0 && listRec.Status != 2  && listRec.Status != 4 
                          ? "#8795b1"
                          : "#00a3ff",
                      createdBy: listRec.CreatedBy,
                      isHover: false,
                      isRowBefore: false,
                      isReassigned: listRec.IsReassigned, 
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
                      isRejected: listRec.IsRejected,
                      isShared: listRec.IsShared,
                      isImportant: listRec.IsImportant,
                      isFollowed: listRec.IsFollowed,
        
                      maxClaims: listRec.MaxClaims,
                      totalClaims:listRec.TotalClaims,
                      sharedStats: listRec.SharedStats,
                      owner_UserId : listRec.Owner_UserId,
                      allowedActions : this._allowedActions.getAllowedActions(
                        listRec.Owner_UserId,
                        listRec.CreatedBy_UserId,
                        listRec.AppType==1
                        ? parseInt(this.engProLoggedInUserId)
                        : parseInt(this.loggedInUserId),
                        this._utils.getActivityStatus(
                          listRec.Status,
                          listRec.ActualValue,
                          listRec.IsShared,
                      ),
                      listRec.AllowedActions,
                      listRec.IsAccepted,
                      listRec.IsReassigned,
                      listRec.AppType==1?true:false,
                      listRec.DueDate,
                      listRec.MaxClaims,
                      listRec.TotalClaims,
                      preURL
                      ),
                      oppProActivityType: listRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        listRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        listRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                      oppProStatus:
                        listRec.OppProStatus == "Cancelled"
                          ? "Cancelled"
                          : listRec.OppProStatus == "Completed" ||
                            listRec.OppProStatus == "Sent"
                          ? "Done"
                          : listRec.OppProStatus == "Planned" ||
                            listRec.OppProStatus == null
                          ? "Not Started"
                          : "In progress",
                    };
                  })
                : [];

              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
              if(this.pageIndex ==1){
                setTimeout(() => {
                  this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
                }, 500);
              }else{
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
  }

  
  loadLess(filter?: any, group?: any, index?: number) {
      this.isLoadingMore = true;
      this.activitiesByGroup.ungrouped=this.activitiesByGroup.ungrouped.splice(0, this.activitiesByGroup.ungrouped.length - this.lastLoadedCount);
      this.activitiesSubject.next(this.activitiesByGroup.ungrouped.length<= 10 ? this.activitiesByGroup.ungrouped :this.activitiesByGroup.ungrouped.slice(-this.lastLoadedCount));
      this.isLoadingMore = false;

  }

  loadMore(filter?: any, group?: any, index?: number) {
    filter = this.setTeamIdForScoreCardInFilter(filter);
    this.search == "" ? (this.search = null) : "";
      this.isLoadingMore = true;
      forkJoin([
      this._activitiesService
        .getAllShared(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.isEngProActivity
        ),
        this._activitiesService
        .getCountForShared(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )]).subscribe(
          (response) => {
            if (!!response) {
              
            let preURL = localStorage.getItem('preURL');
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
                        id: ungroupedRec.Id,
                        // appType: ungroupedRec.ESP_RequestId !=null ? 4: ungroupedRec.AppType,
                        appType : ungroupedRec.SourceSystemTypeId == null ? 0 : ungroupedRec.SourceSystemTypeId == 1 ? 4 : ungroupedRec.SourceSystemTypeId == 2 ? 1 : ungroupedRec.SourceSystemTypeId == 3 ? 2 : ungroupedRec.SourceSystemTypeId == 4 ? 3 : null,
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
                        dueDateLabel: this._utils.getDueDateLabel(
                          ungroupedRec.DueDate
                        ),
                        dueDate:
                          this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                          "Overdue"
                            ? this._utils.getDueDateTimeAgo(
                                ungroupedRec.DueDate
                              )
                            : this._utils.getDueDateLabel(
                                ungroupedRec.DueDate
                              ) == "Due Today"
                            ? "Today"
                            : moment(ungroupedRec.DueDate).format(
                                "DD MMM YYYY"
                              ),
                        effortInHour: ungroupedRec.EffortInHour,
                        effortInMinute: ungroupedRec.EffortInMinute,
                        effortSum: ungroupedRec.EffortSum,
                        unit: ungroupedRec.Unit,
                        parentBoardId: ungroupedRec.ParentBoardId,
                        parentBoardName: ungroupedRec.ParentBoardName,
                        status: ungroupedRec.Status,
                        isShared:ungroupedRec.IsShared,
                        maxClaims: ungroupedRec.MaxClaims,
                        totalClaims:ungroupedRec.TotalClaims,
                        sharedStats: ungroupedRec.SharedStats,
                        progressStatus: ungroupedRec.IsRejected
                          ? "Rejected"
                          : ungroupedRec.Status == 4 &&
                            !ungroupedRec.IsReassigned
                          ? "Cancelled"
                          : ungroupedRec.Status == 4 &&
                            ungroupedRec.IsReassigned
                          ? "Reassigned"
                          : ungroupedRec.Status == 2
                          ? "Done"
                          : ungroupedRec.ActualValue == null
                          ? "Not Started"
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
                            : (ungroupedRec.AppType != 2 &&
                                ungroupedRec.ActualValue == null) ||
                              (ungroupedRec.AppType == 2 &&
                                (ungroupedRec.OppProStatus == "Planned" ||
                                  ungroupedRec.OppProStatus == null))
                            ? "#8795b1"
                            : "#00a3ff",
                        createdBy: ungroupedRec.CreatedBy,
                        isHover: false,
                        isRowBefore: false,
                        isReassigned: ungroupedRec.IsReassigned, 
 isAccepted : ungroupedRec.IsAccepted , 
 isApproved  : ungroupedRec.IsApproved , 
                        isRejected: ungroupedRec.IsRejected,
                        isImportant: ungroupedRec.IsImportant,
                        isFollowed: ungroupedRec.IsFollowed,
                        owner_UserId : ungroupedRec.Owner_UserId,
                        allowedActions : this._allowedActions.getAllowedActions(
                          ungroupedRec.Owner_UserId,
                          ungroupedRec.CreatedBy_UserId,
                          ungroupedRec.AppType==1
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
                        ungroupedRec.AppType==1?true:false,
                        ungroupedRec.DueDate,
                        ungroupedRec.MaxClaims,
                        ungroupedRec.TotalClaims,
                        preURL
                        ),
                        oppProActivityType: ungroupedRec.OppProActivityType,
                        oppProScheduleEndDate: moment(
                          ungroupedRec.OppProScheduleEndDate
                        ).format("hh:mm A"),
                        oppProScheduleStartDate: moment(
                          ungroupedRec.OppProScheduleStartDate
                        ).format("hh:mm A"),
                        oppProStatus:
                          ungroupedRec.OppProStatus == "Cancelled"
                            ? "Cancelled"
                            : ungroupedRec.OppProStatus == "Completed" ||
                              ungroupedRec.OppProStatus == "Sent"
                            ? "Done"
                            : ungroupedRec.OppProStatus == "Planned" ||
                              ungroupedRec.OppProStatus == null
                            ? "Not Started"
                            : "In progress",
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
   
  }

  
  onPageChange(ev:any, filter?: any, group?: any, index?: number){
    if(ev.pageIndex > ev.previousPageIndex){
        this.pageIndex=ev.pageIndex+1;
        this.loadMore(filter, group, index);
    }else{
        this.pageIndex=ev.pageIndex+1;
        // this.loadLess(filter, group, index);
        this.loadMore(filter, group, index);
    }
  }

  resetToDefualt() {
    this.selectedFiltersIds = {
      IsFollowed: true,
      // IsImportant: false,
      StatusIds: [6, 5],
    };
    this.pageIndex = 1;
    this.pageSize =10;
    this.tempUngroupedActivitiesArr = [];
    this.search = null;   
    this.lastLoadedCount =0;
  }

  reloadLists(
    search: string,
    groupByAppliedFilter: number,
    filter?: any
  ) {
    filter = this.setTeamIdForScoreCardInFilter(filter);
    this.isReloadingList = true;
    this.listReloaded = false;
    this.activitiesByGroup.ungrouped = [];
      forkJoin([
      this._activitiesService
        .getAllShared(
          search,
          groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.isEngProActivity
        ),
        this._activitiesService
        .getCountForShared(
          search,
          groupByAppliedFilter,
          this.pageSize,
          this.pageIndex,
          undefined,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
      ]
        )
        .subscribe(
          (response) => {
            if (!!response) {
              
            let preURL = localStorage.getItem('preURL');
              this.totalCount = response[1].ResponseResult.ActivityCount;
              let resp = response[0];
              if (resp.ResponseCode == 2000) {
                
              this.totalCount =response[1].ResponseResult.ActivityCount;
              this.lastLoadedCount = resp.ResponseResult.Activities.length;
                this.activitiesByGroup.ungrouped = !!resp.ResponseResult
                  .Activities
                  ? resp.ResponseResult.Activities.map((ungroupedRec) => {
                      return {
                        id: ungroupedRec.Id,
                        // appType: ungroupedRec.ESP_RequestId !=null ? 4: ungroupedRec.AppType,
                        appType : ungroupedRec.SourceSystemTypeId == null ? 0 : ungroupedRec.SourceSystemTypeId == 1 ? 4 : ungroupedRec.SourceSystemTypeId == 2 ? 1 : ungroupedRec.SourceSystemTypeId == 3 ? 2 : ungroupedRec.SourceSystemTypeId == 4 ? 3 : null,
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
                        dueDateLabel: this._utils.getDueDateLabel(
                          ungroupedRec.DueDate
                        ),
                        dueDate:
                          this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                          "Overdue"
                            ? this._utils.getDueDateTimeAgo(
                                ungroupedRec.DueDate
                              )
                            : this._utils.getDueDateLabel(
                                ungroupedRec.DueDate
                              ) == "Due Today"
                            ? "Today"
                            : moment(ungroupedRec.DueDate).format(
                                "DD MMM YYYY"
                              ),
                        effortInHour: ungroupedRec.EffortInHour,
                        effortInMinute: ungroupedRec.EffortInMinute,
                        effortSum: ungroupedRec.EffortSum,
                        unit: ungroupedRec.Unit,
                        maxClaims: ungroupedRec.MaxClaims,
                        totalClaims:ungroupedRec.TotalClaims,
                        sharedStats: ungroupedRec.SharedStats,
                        parentBoardId: ungroupedRec.ParentBoardId,
                        parentBoardName: ungroupedRec.ParentBoardName,
                        status: ungroupedRec.Status,
                        progressStatus: ungroupedRec.IsRejected
                          ? "Rejected"
                          : ungroupedRec.Status == 4 &&
                            !ungroupedRec.IsReassigned
                          ? "Cancelled"
                          : ungroupedRec.Status == 4 &&
                            ungroupedRec.IsReassigned
                          ? "Reassigned"
                          : ungroupedRec.Status == 2
                          ? "Done"
                          : ungroupedRec.ActualValue == null
                          ? "Not Started"
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
                            : (ungroupedRec.AppType != 2 &&
                                ungroupedRec.ActualValue == null) ||
                              (ungroupedRec.AppType == 2 &&
                                (ungroupedRec.OppProStatus == "Planned" ||
                                  ungroupedRec.OppProStatus == null))
                            ? "#8795b1"
                            : "#00a3ff",
                        createdBy: ungroupedRec.CreatedBy,
                        isHover: false,
                        isRowBefore: false,
                        isReassigned: ungroupedRec.IsReassigned, 
 isAccepted : ungroupedRec.IsAccepted , 
 isApproved  : ungroupedRec.IsApproved , 
                        isRejected: ungroupedRec.IsRejected,
                        isShared: ungroupedRec.IsShared,
                        isImportant: ungroupedRec.IsImportant,
                        isFollowed: ungroupedRec.IsFollowed,
                        owner_UserId : ungroupedRec.Owner_UserId,
                        allowedActions : this._allowedActions.getAllowedActions(
                          ungroupedRec.Owner_UserId,
                          ungroupedRec.CreatedBy_UserId,
                          ungroupedRec.AppType==1
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
                        ungroupedRec.AppType==1?true:false,
                        ungroupedRec.DueDate,
                        ungroupedRec.MaxClaims,
                        ungroupedRec.TotalClaims,
                     preURL
                        ),
                        oppProActivityType: ungroupedRec.OppProActivityType,
                        oppProScheduleEndDate: moment(
                          ungroupedRec.OppProScheduleEndDate
                        ).format("hh:mm A"),
                        oppProScheduleStartDate: moment(
                          ungroupedRec.OppProScheduleStartDate
                        ).format("hh:mm A"),
                        oppProStatus:
                          ungroupedRec.OppProStatus == "Cancelled"
                            ? "Cancelled"
                            : ungroupedRec.OppProStatus == "Completed" ||
                              ungroupedRec.OppProStatus == "Sent"
                            ? "Done"
                            : ungroupedRec.OppProStatus == "Planned" ||
                              ungroupedRec.OppProStatus == null
                            ? "Not Started"
                            : "In progress",
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
                // if(this.pageIndex ==1){
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
    
  }

  reload(ev){
    if (ev == true) {
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

  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
 
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
  }

  openActivityDetails(row: Activity) {
    let queryParams = {
      queryParams: {
        accessedFrom: 'shared',
        preTab: StemeXeListType.Following ,
        innerPreTab:1,
        fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      }
    };
    if(row.isShared){
      localStorage.setItem("preURL", "/pages/activities/following/shared/details" );
    }
    if (row.appType == 3) {
              this._router.navigate([`pages/activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`], queryParams);
    } else if (row.appType == 2) {
         this._router.navigate([`pages/activities/details/oppProAct/${row.id}`],queryParams);
       } else if (row.appType == 1) {
         this._router.navigate([`pages/activities/details/engProAct/${row.id}`],queryParams);
       } else {
         this._router.navigate([`pages/activities/details/${row.id}`],queryParams);
       }
  }

  openFiltersDialog(): void {
    this.isFiltersDialogOpened = true;
    this.resetToDefualt();
    const dialogRef = this._dialog.open(FiltersDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        type: StemeXeListType.Shared,
        selected: this.selectedFilters,
        engProData: {
          isEngProEnabled: this.isEngProEnabled,
          engProLoggedInUserId: this.engProLoggedInUserId,
          // engProUsers: this.engagementProUsers,
          // engProTeams: this.engagementProTeams,
        },
        isShared:true
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.selectedFiltersIds = result.ids;
        this.selectedFilters = result.objs.length > 0 ? result.objs : [];
        this.isDefultFilterApplied = result.isDefault;
        this.reloadLists(
          this.search,
          this.groupByAppliedFilter,
          result.ids
        );
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

  goToActivity() {
    let url = `/pages/activities`;
    this.router.navigate([url], { queryParams: {
      fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
      SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
    }});
  }

  goToApplication() {
    let url = `/pages/activities`;
    this.router.navigate([url], { queryParams: {
      fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
      SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
    }});
  }

  goToFollowing() {
    let url = `/pages/activities`;
    this.router.navigate([url], { queryParams: {
      activeTab: 1,
      fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
      SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
    }});
  }

  onClearFilterS() {
    this.selectedFilters = [];
    this.isDefultFilterApplied = true;
    this.reloadLists(
      this.search,
      this.groupByAppliedFilter,
      this.selectedFiltersIds
    );
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
