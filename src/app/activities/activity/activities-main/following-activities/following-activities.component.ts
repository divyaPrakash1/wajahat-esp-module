import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ActivityUtilsService } from "../../../shared/utils-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { StemeXeGroupType, StemeXeListType } from "../../enums";
import { ActivitiesByGroup } from "../../models/activities-by-group";
import * as moment from "moment";
// import { SimplestrataAuthService } from "../../../shared/services/simplestrata-auth-activity.service";
import { ActivityDialog } from "../../dialogs/activity-dialog/activity-dialog";
import { MatDialog } from "@angular/material/dialog";
import { FiltersDialog } from "../../dialogs/filters-dialog/filters-dialog";
import { Activity } from "../../models/activity";
import { forkJoin, Subject } from 'rxjs';
import { Addon } from '../../../shared/models/addon.model-activity';
import { AllowedActionsService } from '../../services/allowed-actions.service';
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { SimplestrataAuthService } from "src/app/activities/shared/services/simplestrata-auth.service";
// import { SimplestrataAuthService } from "src/app/shared/services/simplestrata-auth.service";

@Component({
  selector: "xcdrs-following-activities",
  templateUrl: "./following-activities.component.html",
  styleUrls: ["./following-activities.component.scss"],
})
export class FollowingActivitiesComponent implements OnInit {
  isLoading: boolean = false;
  isReloadingList: boolean = false;
  isError: boolean = false;
  search: string = '';
  dataLoaded: boolean = false;
  size: string;
  byUserList: Array<any> = [];
  byDueDateList: Array<any> = [];
  activitiesByGroup: ActivitiesByGroup = new ActivitiesByGroup();
  groupType: number = StemeXeGroupType.People;

  dataSourceArr: Array<any> = new Array();
  tempArr: Array<any> = new Array();

  isFirstRow: boolean = false;
  isFirstRowInGroup: Array<boolean> = [];
  loggedInUserId: any;
  isAllUngroupedAssignedByLoggedIn: boolean = false;
  isAllgroupedAssignedByLoggedIn: Array<boolean> = new Array();
  @Input() selectedIndex: number | null;
  tabIndex: number = 0;
  selectedFiltersIds: any = {
    IsFollowed: true,
    IsImportant: false,
    StatusIds: [6, 5, 4, 2],
  };
  selectedFilters: Array<any> = [];
  @Input() isEngProEnabled: boolean = false;
  @Input() isESPcomponent: boolean = false;
  @Input() engProLoggedInUserId: string = '';
  @Input() engProUsers: Array<any> = [];
  @Input() engProTeams: Array<any> = [];
  @Input() isEspEnabled: boolean = false;
  @Input() espAddon: Addon = null;
  @Input() requestName: any = null;
  @Input() requestModuleName: any = null;
  isLoadingMore: boolean = false;
  activeTab: number = StemeXeListType.Following;
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
  tableList:Activity[] =[];
  isFiltersDialogOpened: boolean = false;
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
    public _dialog: MatDialog,
    private _allowedActions: AllowedActionsService,
    private _actRoute: ActivatedRoute,
  ) {
    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
      if (this.size == "XS" || this.size == "SM") {
        this.pageSize = 10;
      }
    });
    this.tabIndex  = !!this._actRoute.snapshot.queryParams['innerPreTab'] ? this._actRoute.snapshot.queryParams['innerPreTab'] : 0;

    this._actRoute.queryParams.subscribe(params => {
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
    this.activateTab();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  activateTab(){
    if (this.tabIndex == 0) {
      this.groupType = StemeXeGroupType.People;
      this.loadList(this.search, this.groupType, this.selectedFiltersIds);
    } else {
      this.groupType = StemeXeGroupType.DueDate;
      this.loadList(this.search, this.groupType);
    }
  }


  loadList(search: string, groupType: number, filter?: any) {
    this.isLoading = true;
    this.activitiesByGroup.groups = [];
    this.activitiesByGroup.ungrouped = [];
    filter = this.setTeamIdForScoreCardInFilter(filter);
    this._activitiesService
      .getAllGroupsForFollowing(
        search,
        groupType,
        filter,
        this.engProLoggedInUserId
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.activitiesByGroup.newReported = resp.ResponseResult.NewReported.map(
                (newReportedRec) => {
                  return {
                    id: newReportedRec.Id,
                    // appType: newReportedRec.ESP_RequestId !=null ? 4: newReportedRec.AppType,
                    appType : newReportedRec.SourceSystemTypeId == null ? 0 : newReportedRec.SourceSystemTypeId == 1 ? 4 : newReportedRec.SourceSystemTypeId == 2 ? 1 : newReportedRec.SourceSystemTypeId == 3 ? 2 : newReportedRec.SourceSystemTypeId == 4 ? 3 : newReportedRec.SourceSystemTypeId == 5 ? 5 : null,
                    requestId: newReportedRec.ESP_RequestId,
                    requestName: newReportedRec.ESP_RequestName,
                    requestNumber: newReportedRec.ESP_RequestNumber,
                    tacticTitle: newReportedRec.TacticTitle,
                    description: newReportedRec.Description,
                    targetValue: newReportedRec.TargetValue,
                    actualValue: newReportedRec.ActualValue,
                    createdBy_UserId: newReportedRec.CreatedBy_UserId,
                    score: newReportedRec.Score,
                    completedDate: moment(newReportedRec.CompletedDate).format(
                      "DD MMM YYYY"
                    ),
                    dueDate: moment(newReportedRec.DueDate).format(
                      "DD MMM YYYY"
                    ),
                    isOverdue:
                      this._utils.getDueDateLabel(newReportedRec.DueDate) ==
                      "Overdue"
                        ? true
                        : false,
                    effortInHour: newReportedRec.EffortInHour,
                    effortInMinute: newReportedRec.EffortInMinute,
                    unit: newReportedRec.Unit,
                    parentBoardId: newReportedRec.ParentBoardId,
                    parentBoardName: newReportedRec.ParentBoardName,
                    status: newReportedRec.Status,
                    createdBy: newReportedRec.CreatedBy,
                    userOwner: newReportedRec.UserOwner,
                    owner: newReportedRec.UserOwner,
                  };
                }
              );

              
              if (groupType == StemeXeGroupType.People) {
                this.activitiesByGroup.groupByPeople =
                  resp.ResponseResult.GroupByPeople;
                  !!resp.ResponseResult.SharedGroup? this.activitiesByGroup.sharedGroup = resp.ResponseResult.SharedGroup:null;

              } else {
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
                        isAllActivitiesLoaded:
                          groupRec.Count == 0 ? true : false,
                          lastLoadedCount:0,
                        isLoadingMore: false,
                      };
                    })
                  : [];
                  resp.ResponseResult.GroupByPeople;
                  !!resp.ResponseResult.SharedGroup? this.activitiesByGroup.sharedGroup = resp.ResponseResult.SharedGroup:null;
                
              }
              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
              
            } else {
              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
              
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.dataLoaded = true;
          this.isLoading = false;
          
          this.isError = true;
        }
      );
  }

  loadGroupActivities(index?: number, group?: any, filter?: any) {
    group.isGroupExpanded = !group.isGroupExpanded;
    this.activitiesByGroup.groups.forEach(grp=>{
      if(grp.groupId != group.groupId) {
        group.isGroupExpanded= false;
      }
    })
    if (group.isGroupExpanded) {
      this.search == "" ? (this.search = null) : "";
      group.isGroupActivitiesLoading = true;
      forkJoin([     
        
      this._activitiesService
        .getAllByGroupForFollowing(
          this.search,
          this.groupType,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
          // ,
          // this.oppProData,
          // this.isOppProEnabled
        ),
        this._activitiesService
        .getCountForFollowing(
          this.search,
          this.groupType,
          this.pageSize,
          this.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
          // ,
          // this.oppProData,
          // this.isOppProEnabled
        )
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.totalCount =response[1].ResponseResult.ActivityCount;
            let resp = response[0];
              if (resp.ResponseCode == 2000) {
                
              this.lastLoadedCount = resp.ResponseResult.Activities.length;
                
                this.activitiesByGroup.groups[index].groupList = !!resp
                  .ResponseResult.Activities
                  ? resp.ResponseResult.Activities.map((listRec) => {
                      return {
                        id: listRec.Id,
                        // appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
                        appType : listRec.SourceSystemTypeId == null ? 0 : listRec.SourceSystemTypeId == 1 ? 4 : listRec.SourceSystemTypeId == 2 ? 1 : listRec.SourceSystemTypeId == 3 ? 2 : listRec.SourceSystemTypeId == 4 ? 3 : listRec.SourceSystemTypeId == 5 ? 5 : null,
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
                        progressStatus: listRec.IsRejected
                          ? "Rejected"
                          : listRec.Status == 4 && !listRec.IsReassigned
                          ? "Cancelled"
                          : listRec.Status == 4 && listRec.IsReassigned
                          ? "Reassigned"
                          : listRec.Status == 2
                          ? "Done"
                          : listRec.ActualValue == null
                          ? "Not Started"
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
                            : (listRec.AppType != 2 &&
                                listRec.ActualValue == null) ||
                              (listRec.AppType == 2 &&
                                (listRec.OppProStatus == "Planned" ||
                                  listRec.OppProStatus == null))
                            ? "#8795b1"
                            : "#00a3ff",
                        createdBy: listRec.CreatedBy,
                        userOwner: listRec.UserOwner,
                        isHover: false,
                        isRowBefore: false,
                        isReassigned: listRec.IsReassigned, 
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
 isReopened  : listRec.IsReopened , 
                        isRejected: listRec.IsRejected,
                        isShared: listRec.IsShared,
                        isImportant: listRec.IsImportant,
                        isFollowed: listRec.IsFollowed,
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

                this.isError = false;
                group.isGroupActivitiesLoading = false;
                
                if(this.pageIndex ==1){
                  setTimeout(() => {
                    this.activitiesSubject.next(this.activitiesByGroup.groups[index].groupList);
                      
                  }, 500);
                }else{
                  this.activitiesSubject.next(this.activitiesByGroup.groups[index].groupList);
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
      group.lastLoadedCount =0;
      group.isGroupExpanded = false;
    }
  }

  loadLess(filter?: any, group?: any, index?: number) {
    group.isLoadingMore = true;
    this.activitiesByGroup.groups[index].groupList=this.activitiesByGroup.groups[index].groupList.splice(0, this.activitiesByGroup.groups[index].groupList.length - group.lastLoadedCount);
    this.activitiesSubject.next(this.activitiesByGroup.groups[index].groupList.length<= 10 ? this.activitiesByGroup.groups[index].groupList :this.activitiesByGroup.groups[index].groupList.slice(-group.lastLoadedCount));
    group.isLoadingMore = false;
    
  }

  loadMore(filter?: any, group?: any, index?: number) {
    this.search == "" ? (this.search = null) : "";
    group.isLoadingMore = true;
    forkJoin([
    this._activitiesService
      .getAllByGroupForFollowing(
        this.search,
        this.groupType,
        this.pageSize,
        group.pageIndex,
        group,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId
        // ,
        // this.oppProData,
        // this.isOppProEnabled
      ),
      this._activitiesService
      .getCountForFollowing(
        this.search,
        this.groupType,
        this.pageSize,
        group.pageIndex,
        group,
        !!filter ? filter : undefined,
        this.engProLoggedInUserId
        // ,
        // this.oppProData,
        // this.isOppProEnabled
      )
    ]).subscribe(
      (response) => {
        if (!!response) {
          this.totalCount =response[1].ResponseResult.ActivityCount;
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
                      id: listRec.Id,
                      // appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
                      appType : listRec.SourceSystemTypeId == null ? 0 : listRec.SourceSystemTypeId == 1 ? 4 : listRec.SourceSystemTypeId == 2 ? 1 : listRec.SourceSystemTypeId == 3 ? 2 : listRec.SourceSystemTypeId == 4 ? 3 : listRec.SourceSystemTypeId == 5 ? 5 : null,
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
                      progressStatus: listRec.IsRejected
                        ? "Rejected"
                        : listRec.Status == 4 && !listRec.IsReassigned
                        ? "Cancelled"
                        : listRec.Status == 4 && listRec.IsReassigned
                        ? "Reassigned"
                        : listRec.Status == 2
                        ? "Done"
                        : listRec.ActualValue == null
                        ? "Not Started"
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
                          : (listRec.AppType != 2 &&
                              listRec.ActualValue == null) ||
                            (listRec.AppType == 2 &&
                              (listRec.OppProStatus == "Planned" ||
                                listRec.OppProStatus == null))
                          ? "#8795b1"
                          : "#00a3ff",
                      createdBy: listRec.CreatedBy,
                      userOwner: listRec.UserOwner,
                      isHover: false,   
                      isRowBefore: false,
                      isReassigned: listRec.IsReassigned, 
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
 isReopened  : listRec.IsReopened , 
                      isRejected: listRec.IsRejected,
                      isShared: listRec.IsShared,
                      isImportant: listRec.IsImportant,
                      isFollowed: listRec.IsFollowed,
                      owner_UserId : listRec.Owner_UserId,
                      allowedActions:
                      this._allowedActions.getAllowedActions(
                        listRec.Owner_UserId,
                        listRec.CreatedBy_UserId,
                        listRec.AppType==1
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
                      listRec.AppType==1?true:false,
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
                this.activitiesSubject.next(this.activitiesByGroup.groups[index].groupList);

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

  reload(ev){
    if(ev == true){
      this.loadList(this.search, this.groupType);
    }
  }

  onPageChange(ev:any, filter?: any, group?: any, index?: number){
    if(ev.pageIndex > ev.previousPageIndex){
        group.pageIndex=ev.pageIndex+1;
        this.loadMore(filter, group, index);
    }else{
      group.pageIndex=ev.pageIndex+1;
      // this.loadLess(filter, group, index);
        this.loadMore(filter, group, index);
    }
  }


  onTabClick(event) {
    
    if (this.tabIndex==1) {
      this.groupType = StemeXeGroupType.People;
      this.loadList(this.search, this.groupType, this.selectedFiltersIds);
      this.tabIndex = 0;
    } else {
      this.groupType = StemeXeGroupType.DueDate;
      this.loadList(this.search, this.groupType);
      this.tabIndex = 1;
    }
  }

  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
    this.loadList(this.search, this.groupType, this.selectedFiltersIds);
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

  openSharedGroupDetails() {
    console.log("openSharedGroupDetails");
    localStorage.setItem("preURL", "/pages/activities/f" );
    let queryParams = {
      queryParams: {
        accessedFrom: 'list',
        preTab: StemeXeListType.Following,
        fromTab: this.fromTab, boardId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      }
    };
    this._router.navigate([`pages/activities/following/shared/details`], queryParams );
  }

  openUserGroupDetails(group) {
    console.log("openUserGroupDetails");
    let queryParams = {
      queryParams: {
        accessedFrom: 'list',
        preTab: StemeXeListType.Following,
        innerPreTab:this.tabIndex,
        fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      }
    };
    if (group.appType == 2) {
      this._router.navigate([
        `pages/activities/details/oppProAct/${group.UserId}`
      ], queryParams);
    } else if (group.AppType == 1) {
      this._router.navigate([
        `pages/activities/following/details/engProAct/${group.UserId}`
      ], queryParams);
    } else {
      this._router.navigate([
        `pages/activities/following/details/${group.UserId}`
      ], queryParams);
    }
  }

  openActivityDetails(row: Activity) {
    let queryParams = {
      queryParams: {
        accessedFrom: 'list',
        preTab: StemeXeListType.Following,
        innerPreTab:this.tabIndex,
        fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      }
    };
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
    this.resetToDefualt();
    const dialogRef = this._dialog.open(FiltersDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: { type: StemeXeListType.Following },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.selectedFiltersIds = result.ids;
        this.selectedFilters = result.objs.length > 0 ? result.objs : [];
        this.loadList(this.search, this.groupType, result.ids);
      } else {
        this.loadList(this.search, this.groupType);
      }
    });
  }

 
  openAssignDialog(formMode: string): void {
    this.resetToDefualt();
    const dialogRef = this._dialog.open(ActivityDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        isMine: false,
        formMode: formMode,
        engProData: {
          isEngProEnabled: this.isEngProEnabled,
          engProLoggedInUserId: this.engProLoggedInUserId,
          engProUsers: this.engProUsers,
          engProTeams: this.engProTeams,
        },
        espAddon:this.espAddon,
        isEspEnabled:this.isEspEnabled,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!!result){
        this.activateTab();
      }
    });
  }

  resetToDefualt() {
    this.selectedFiltersIds = {
      IsFollowed: true,
      IsImportant: false,
      StatusIds: [6, 5, 4, 2],
    };
    this.pageIndex = 1;
    this.pageSize = 10;
    this.tempUngroupedActivitiesArr = [];
    this.search = null;
    this.lastLoadedCount =0;
  }

  addActivityToFollowing(event) {
    this.loadList(this.search, this.groupType, this.selectedFiltersIds);
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
