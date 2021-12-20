import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import * as moment from 'moment';
import { forkJoin, Subject } from 'rxjs';
import { ActivityUtilsService } from '../../shared/utils-activity.service';
import { ActivityAlertService } from '../../shared/alert/alert-activity.service';
import { ScheduleDueDateDialog } from '../dialogs/schedule-due-date-dialog/schedule-due-date-dialog';
import { StemeXeListType } from '../enums';
import { Activity } from '../models/activity';
import { ActivitiesService } from '../services/activities.service';
import { AllowedActionsService } from '../services/allowed-actions.service';

@Component({
  selector: 'xcdrs-activities-group',
  templateUrl: './activities-group.component.html',
  styleUrls: ['./activities-group.component.scss']
})
export class ActivitiesGroupComponent implements OnInit {
  @Input() group:any;
  @Input() userId:any;
  @Input() i:number;
  @Input() selectedFiltersIds:any;
  @Input() search:string;
  @Input() loggedInUserId: any;
  @Input() activeTab: any;
  @Input() engProLoggedInUserId: any;
  @Input() isEngProActivity: any;
  @Input() totalCount: number;  
  @Input() lastLoadedCount: number;
  @Input() isEngProEnabled:boolean;
  @Input() groupByAppliedFilter:any;
  pageSize:number=10;
  // @Input() pageIndex:number;
  @Input() oppProData:any;
  @Input() isOppProEnabled:boolean;
  isElementBtnClicked = false;
  
  @Output() reloadList: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectedGroup: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("scrollableContainer")
  scrollableContainer: ElementRef;
  isError: boolean = false;
  @Input() size: string;
  @Input() isWeekView: boolean = false;
  tempGroupedActivitiesArr: Array<any> = new Array();
  activitiesSubject: Subject<Activity[]> = new Subject<Activity[]>();
  isArabic: boolean = false;
  groupNameDateView: boolean = false;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(  private _activitiesService: ActivitiesService,
    private _router: Router,
    private _utils: ActivityUtilsService,
    private _allowedActions: AllowedActionsService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    private route: ActivatedRoute) {

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

     }

  ngOnInit(): void {
    this.getLanguage();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
    this.groupNameDateView = (this.group.groupName.startsWith("This Week") || this.group.groupName.startsWith("Overdue"));
  }

  doBacklogAction(type, activity) {
    if (type == "Today") {
      let data = {
        id: activity.id,
        dueDate: moment(new Date()).format("LL"),
      };
      this._activitiesService
        .UpdateDueDate(data, this.engProLoggedInUserId, activity.appType == 1)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.reloadList.emit(true);
              //this.isElementBtnClicked = false;
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              //this.isElementBtnClicked = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      const dialogRef = this._dialog.open(ScheduleDueDateDialog, {
        width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
        height: this.size == "XS" || this.size == "SM" ? "100%" : "416px",
        maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
        maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
        data: {
          activity: activity,
          engProLoggedInUserId: this.engProLoggedInUserId,
          isEngProActivity: activity.appType == 1 ? true : false,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.reloadList.emit(true);
        //this.isElementBtnClicked = false;
      });
    }
  }


  reload(ev){
    if (ev == true) {
      this.reloadList.emit(true);
    }
  }
    //load Activities of a group
    loadGroupActivities(index?: number, group?: any, filter?: any) {
      this.selectedGroup.emit(group);
      switch(this.activeTab){
        case StemeXeListType.Mine:
          this.loadGroupActivitiesForMine(index, group,filter );
          break;

          case StemeXeListType.Following:
            this.loadGroupActivitiesForFollowing(index, group,filter );
            break;

            case StemeXeListType.Backlog:
              this.loadGroupActivitiesForBacklog(index, group,filter );
              break;

              case StemeXeListType.User:
                this.loadGroupActivitiesForUser(index, group,filter );
                break;
      }

    }
    loadGroupActivitiesForFollowing(index?: number, group?: any, filter?: any) {
      group.isGroupExpanded = !group.isGroupExpanded;

      if (group.isGroupExpanded) {
        this.search == "" ? (this.search = null) : "";
        group.isGroupActivitiesLoading = true;
        forkJoin([     
          
        this._activitiesService
          .getAllByGroupForFollowing(
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId
          ),
          this._activitiesService
          .getCountForFollowing(
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId
          )
        ]).subscribe(
          (response) => {
            if (!!response) {
              this.totalCount =response[1].ResponseResult.ActivityCount;
              let resp = response[0];
                if (resp.ResponseCode == 2000) {
                  
                this.lastLoadedCount = resp.ResponseResult.Activities.length;
                  
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          id: listRec.Id,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
  
                  this.isError = false;
                  group.isGroupActivitiesLoading = false;
                  
                  if(group.pageIndex ==1){
                    setTimeout(() => {
                      this.activitiesSubject.next(group.groupList);
                        
                    }, 500);
                  }else{
                    this.activitiesSubject.next(group.groupList);
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

  //load Activities of a group
  loadGroupActivitiesForBacklog(index?: number, group?: any, filter?: any) {
    group.isGroupExpanded = !group.isGroupExpanded;

    if (group.isGroupExpanded) {
      this.search == "" ? (this.search = null) : "";
      group.isGroupActivitiesLoading = true;
      forkJoin([
      this._activitiesService
        .getAllByGroupForBacklog(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
        ),
        this._activitiesService
        .getCountForBacklog(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
        )
      ]).subscribe(
          
        (response) => {
          if (!!response) {
            this.totalCount =response[1].ResponseResult.ActivityCount;
            let resp = response[0];
              if (resp.ResponseCode == 2000) {
                
                this.lastLoadedCount = resp.ResponseResult.Activities.length;
                group.groupList = !!resp
                  .ResponseResult.Activities
                  ? resp.ResponseResult.Activities.map((listRec) => {
                      return {
                        id: listRec.Id,
                        appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                        startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
                        effortInHour: listRec.EffortInHour,
                        effortInMinute: listRec.EffortInMinute,
                        effortSum: listRec.EffortSum,
                        unit: listRec.Unit,
                        parentBoardId: listRec.ParentBoardId,
                        parentBoardName: listRec.ParentBoardName,
                        status: listRec.Status,
                        progressStatus: listRec.IsRejected
                          ? "Rejected"
                          : listRec.Status == 4
                          ? "Cancelled"
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
                       
                        isHover: false,
                        isRowBefore: false,
                        isReassigned: listRec.IsReassigned, 
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
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

                this.isError = false;
                group.isGroupActivitiesLoading = false;
                if(group.pageIndex ==1){
                  setTimeout(() => {
                    this.activitiesSubject.next(group.groupList);
                      
                  }, 500);
                }else{
                  this.activitiesSubject.next(group.groupList);
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

    loadGroupActivitiesForMine(index?: number, group?: any, filter?: any) {
      group.isGroupExpanded = !group.isGroupExpanded;

  
      if (group.isGroupExpanded) {
        this.search == "" ? (this.search = null) : "";
        group.isGroupActivitiesLoading = true;
        forkJoin([     
          
        this._activitiesService
        .getAllByGroupForMine(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId,
          this.oppProData,
          this.isOppProEnabled
        )
        ,
          
          this._activitiesService
          .getCountForMine(
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
              this.totalCount =response[1].ResponseResult.ActivityCount;
              let resp = response[0];
                if (resp.ResponseCode == 2000) {
                  
                this.lastLoadedCount = resp.ResponseResult.Activities.length;
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          id: listRec.AppType==3? listRec.EpmInfo.TaskId :listRec.Id,
                          epmInfo:listRec.EpmInfo,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
                              : listRec.AppType != 2 &&
                                listRec.ActualValue == null
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
                          isAccepted : listRec.IsAccepted , 
                          isApproved  : listRec.IsApproved , 
                          isRejected: listRec.IsRejected,
                          isShared: listRec.IsShared,
                          isImportant: listRec.IsImportant,
                          isFollowed: listRec.IsFollowed,
                          oppProActivityType: listRec.OppProActivityType,
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
                   
                      // setTimeout(() => {
                        
                      // }, 2000);
                    
                  this.isError = false;
                  group.isGroupActivitiesLoading = false;
  
                  if(group.pageIndex ==1){
                    setTimeout(() => {
                      this.activitiesSubject.next(group.groupList);
                        
                    }, 500);
                  }else{
                    this.activitiesSubject.next(group.groupList);
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

    loadGroupActivitiesForUser(index?: number, group?: any, filter?: any) {
      group.isGroupExpanded = !group.isGroupExpanded;

      if (group.isGroupExpanded) {
        this.search == "" ? (this.search = null) : "";
        group.isGroupActivitiesLoading = true;
        forkJoin([
        this._activitiesService
          .getAllByGroupForUser(
            this.userId,
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId,
            this.isEngProActivity
          ),
          this._activitiesService
          .getCountForUser(
            this.userId,
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
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
                  
                  // this.activitiesByGroup.userId = resp.ResponseResult.UserId;
                  // this.activitiesByGroup.userFirstName =
                  //   resp.ResponseResult.UserFirstName;
                  // this.activitiesByGroup.userLastName =
                  //   resp.ResponseResult.UserLastName;
                  // this.activitiesByGroup.userProfilePictureurl =
                  //   resp.ResponseResult.UserProfilePictureurl;
                  // this.activitiesByGroup.userPosition =
                  //   resp.ResponseResult.UserPosition;
                  // this.activitiesByGroup.assignedCount =
                  //   resp.ResponseResult.AssignedCount;
                  // this.activitiesByGroup.notStartedCount =
                  //   resp.ResponseResult.NotStartedCount;
                  // this.activitiesByGroup.overdueCount =
                  //   resp.ResponseResult.OverdueCount;
  
                  this.lastLoadedCount = resp.ResponseResult.Activities.length;
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          id: listRec.Id,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
  
                  this.isError = false;
                  group.isGroupActivitiesLoading = false;
                  if(group.pageIndex ==1){
                    setTimeout(() => {
                      this.activitiesSubject.next(group.groupList);
                        
                    }, 500);
                  }else{
                    this.activitiesSubject.next(group.groupList);
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
        group.groupList=group.groupList.splice(0, group.groupList.length - group.lastLoadedCount);
        this.activitiesSubject.next(group.groupList.length<= 10 ? group.groupList :group.groupList.slice(-group.lastLoadedCount));
        group.isLoadingMore = false;
      
    }
  
    loadMoreForMine(filter?: any, group?: any, index?: number) {
      this.search == "" ? (this.search = null) : "";
  
        group.isLoadingMore = true;
  
        forkJoin([ 
        this._activitiesService
          .getAllByGroupForMine(
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
            
          this._activitiesService
          .getCountForMine(
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
              this.totalCount =response[1].ResponseResult.ActivityCount;
              let resp = response[0];
                if (resp.ResponseCode == 2000) {
                  if (resp.ResponseResult.Activities.length == 0) {
                    group.isAllActivitiesLoaded = true;
                    group.isLoadingMore = false;
                    return;
                  }
  
                  this.tempGroupedActivitiesArr= !!group.groupList
                    ? group.groupList
                    : [];
  
                    group.lastLoadedCount = resp.ResponseResult.Activities.length;
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          
                          id: listRec.AppType==3? listRec.EpmInfo.TaskId :listRec.Id,                   
                          epmInfo:listRec.EpmInfo,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
                              : listRec.AppType != 2 &&
                                listRec.ActualValue == null
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
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
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
                    this.activitiesSubject.next(group.groupList);
                  for (
                    var i = 0;
                    i < group.groupList.length;
                    i++
                  ) {
                    this.tempGroupedActivitiesArr.push(
                      group.groupList[i]
                    );
                  }
  
                  group.groupList = this.tempGroupedActivitiesArr;
  
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


    loadMoreForBacklog(filter?: any, group?: any, index?: number) {
      this.search == "" ? (this.search = null) : "";

        group.isLoadingMore = true;
        forkJoin([
        this._activitiesService
          .getAllByGroupForBacklog(
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId
          ),
          this._activitiesService
          .getAllByGroupForBacklog(
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId
          )
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
  
                  this.tempGroupedActivitiesArr = !!group.groupList
                    ? group.groupList
                    : [];
  
                    group.lastLoadedCount = resp.ResponseResult.Activities.length;
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          id: listRec.Id,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
                          unit: listRec.Unit,
                          parentBoardId: listRec.ParentBoardId,
                          parentBoardName: listRec.ParentBoardName,
                          status: listRec.Status,
                          progressStatus: listRec.IsRejected
                            ? "Rejected"
                            : listRec.Status == 4
                            ? "Cancelled"
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
                          isHover: false,
                        isRowBefore: false,
                        isReassigned: listRec.IsReassigned, 
 isAccepted : listRec.IsAccepted , 
 isApproved  : listRec.IsApproved , 
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
  
                    this.activitiesSubject.next(group.groupList);
                  for (
                    var i = 0;
                    i < group.groupList.length;
                    i++
                  ) {
                    this.tempGroupedActivitiesArr.push(
                      group.groupList[i]
                    );
                  }
  
                  group.groupList = this.tempGroupedActivitiesArr;
  
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
    

    loadMoreForUser(filter?: any, group?: any, index?: number) {
      this.search == "" ? (this.search = null) : "";

        group.isLoadingMore = true;
        forkJoin([
        this._activitiesService
          .getAllByGroupForUser(
            this.userId,
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId,
            this.isEngProActivity
          ),
          this._activitiesService
          .getAllByGroupForUser(
            this.userId,
            this.search,
            this.groupByAppliedFilter,
            this.pageSize,
            group.pageIndex,
            group,
            !!filter ? filter : undefined,
            this.engProLoggedInUserId,
            this.isEngProActivity
          )
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
  
                  this.tempGroupedActivitiesArr = !!group.groupList
                    ? group.groupList
                    : [];
  
                    group.lastLoadedCount = resp.ResponseResult.Activities.length;
                  group.groupList = !!resp
                    .ResponseResult.Activities
                    ? resp.ResponseResult.Activities.map((listRec) => {
                        return {
                          id: listRec.Id,
                          appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                          startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
  
                    this.activitiesSubject.next(group.groupList);
                  for (
                    var i = 0;
                    i < group.groupList.length;
                    i++
                  ) {
                    this.tempGroupedActivitiesArr.push(
                      group.groupList[i]
                    );
                  }
  
                 group.groupList = this.tempGroupedActivitiesArr;
  
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
  


    loadMoreForType(filter?: any, group?: any, index?: number){
      switch(this.activeTab){
        case StemeXeListType.Mine:
          this.loadMoreForMine(filter, group, index);
          break;

          case StemeXeListType.Following:
            this.loadMoreForFollowing(filter, group, index);
            break;

            case StemeXeListType.Backlog:
              this.loadMoreForBacklog(filter, group, index);
              break;

              case StemeXeListType.User:
                this.loadMoreForUser(filter, group, index);
                break;
      }
    }





    loadMoreForFollowing(filter?: any, group?: any, index?: number) {
      this.search == "" ? (this.search = null) : "";
      group.isLoadingMore = true;
      forkJoin([
      this._activitiesService
        .getAllByGroupForFollowing(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
        ),
        this._activitiesService
        .getCountForFollowing(
          this.search,
          this.groupByAppliedFilter,
          this.pageSize,
          group.pageIndex,
          group,
          !!filter ? filter : undefined,
          this.engProLoggedInUserId
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
  
                this.tempGroupedActivitiesArr[index] = !!group.groupList
                  ? group.groupList
                  : [];
                  group.lastLoadedCount = resp.ResponseResult.Activities.length;
  
  
                group.groupList = !!resp
                  .ResponseResult.Activities
                  ? resp.ResponseResult.Activities.map((listRec) => {
                      return {
                        id: listRec.Id,
                        appType: listRec.ESP_RequestId !=null ? 4: listRec.AppType,
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
                        startDate: listRec.StartDate ? moment(listRec.StartDate).format("DD MMM YYYY") : null,
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
                  this.activitiesSubject.next(group.groupList);
  
                for (
                  var i = 0;
                  i < group.groupList.length;
                  i++
                ) {
                  this.tempGroupedActivitiesArr[index].push(
                    group.groupList[i]
                  );
                }
  
                group.groupList = this.tempGroupedActivitiesArr[index];
  
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
  
    onPageChange(ev:any, filter?: any, group?: any, index?: number){
        if(ev.pageIndex > ev.previousPageIndex){
    
              group.pageIndex=ev.pageIndex+1;
            this.loadMoreForType(filter, group, index);
        }else{
         
              group.pageIndex=ev.pageIndex+1;
            
          // this.loadLess(filter, group, index);
            this.loadMoreForType(filter, group, index);
        }
    }

    openActivityDetails(row: Activity) {
        let queryParams = {
          queryParams: {
            accessedFrom: this.activeTab == StemeXeListType.Shared? 'shared': this.activeTab == StemeXeListType.User? 'user': 'list',
            preTab:this.activeTab == StemeXeListType.Mine ? StemeXeListType.Mine : this.activeTab == StemeXeListType.Backlog ? StemeXeListType.Backlog  : StemeXeListType.Following ,
            innerPreTab:this.activeTab == StemeXeListType.Following? 1:null,
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
          this._router.navigate([`pages/activities/details/oppProAct/${row.id}`], queryParams);
        } else if (row.appType == 1) {
          this._router.navigate([`pages/activities/details/engProAct/${row.id}`], queryParams);
        } else {
          this._router.navigate([`pages/activities/details/${row.id}`], queryParams);
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
          this.loadMoreForType(this.selectedFiltersIds, group, i);
        }
      }
    }
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

}
