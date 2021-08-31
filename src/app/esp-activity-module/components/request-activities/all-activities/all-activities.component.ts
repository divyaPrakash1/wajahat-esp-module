import { EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertService } from '../../../../esp-activity-module/alert/alert.service';
import { StemeXeListType } from '../../../../esp-activity-module/enums/enums';
import { SCREEN_SIZE } from '../../../../esp-activity-module/enums/shared.enums';
import { Activity } from '../../../../esp-activity-module/models/activity';
import { ActivitiesService } from '../../../../esp-activity-module/services/activities.service';
import { AllowedActionsService } from '../../../../esp-activity-module/services/allowed-actions.service';
import { ResizeService } from '../../../../esp-activity-module/services/resize.service';
import { SimplestrataAuthService } from '../../../../esp-activity-module/services/simplestrata-auth.service';
import { UtilsService } from '../../../../esp-activity-module/services/utils.service';

import * as moment from 'moment';
import { forkJoin, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
// import { AlertService } from 'src/app/esp-activity-module/alert/alert.service';
// import { StemeXeListType } from 'src/app/esp-activity-module/enums/enums';
// import { SCREEN_SIZE } from 'src/app/esp-activity-module/enums/shared.enums';
// import { Activity } from 'src/app/esp-activity-module/models/activity';
// import { ActivitiesService } from 'src/app/esp-activity-module/services/activities.service';
// import { AllowedActionsService } from 'src/app/esp-activity-module/services/allowed-actions.service';
// import { ResizeService } from 'src/app/esp-activity-module/services/resize.service';
// import { SimplestrataAuthService } from 'src/app/esp-activity-module/services/simplestrata-auth.service';
// import { UtilsService } from 'src/app/esp-activity-module/services/utils.service';
import { ActivityDialog } from '../../dialogs/activity-dialog/activity-dialog';
import { FiltersDialog } from '../../dialogs/filters-dialog/filters-dialog';
// import { ActivityDialog } from '../../../../../request/activities/dialogs/activity-dialog/activity-dialog';
// //import { FiltersDialog } from 'src/app/request/activities/dialogs/filters-dialog/filters-dialog';
// import { StemeXeGroupType, StemeXeListType } from '../../../../../request/activities/enums';
// import { Activity } from '../../../../../request/activities/models/activity';
// import { ActivitiesService } from '../../../../../request/activities/services/activities.service';
// import { AllowedActionsService } from '../../../../../request/activities/services/allowed-actions.service';
// import { AlertService } from '../../../../../request/shared/alert/alert.service';
// import { ResizeService } from '../../../../../request/shared/services/resize.service';
// import { SimplestrataAuthService } from '../../../../../request/shared/services/simplestrata-auth.service';
// import { SCREEN_SIZE } from '../../../../../request/shared/shared.enums';
// import { UtilsService } from '../../../../../request/shared/utils.service';

@Component({
  selector: 'xcdrs-all-activities',
  templateUrl: './all-activities.component.html',
  styleUrls: ['./all-activities.component.scss']
})
export class AllActivitiesComponent implements OnInit {
  @Input() requestId!:number;
  @Input() requestModuleName!:string;
  @Input() requestName!:string;
  @Input() isMyspace!:boolean;
  @Output() onReload: EventEmitter<boolean> = new EventEmitter<boolean>();
  isLoading:boolean=false;
  isLoadingMore:boolean=false;
  isError:boolean=false;
  dataLoaded:boolean=false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount:any=null;
  lastLoadedCount:number=0;
  activitiesSubject: Subject<Activity[]> = new Subject<Activity[]>();
  loggedInUserId: any;
  isAllUngroupedActivitiesLoaded: boolean = false;
  tempUngroupedActivitiesArr: Array<any> = new Array();
  activities:Activity[]=[];
  size!:string;
  search: any = '';
  selectedFiltersIds: any = {
    IsFollowed: true,
    IsImportant: false,
    StatusIds: [6, 5],
  };
  selectedFilters: Array<any> = [];
  isFiltersDialogOpened: boolean = false;
  activeTab: number = StemeXeListType.Mine;
  isDefultFilterApplied: boolean = true;
  constructor(     private _activitiesService: ActivitiesService,
    private _resizeService: ResizeService,
    private _router: Router,
    private _utils: UtilsService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _alertService: AlertService,
    public _dialog: MatDialog,
    private _allowedActions: AllowedActionsService) {
      this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;
      this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
        this.size = SCREEN_SIZE[x];

        if (this.size == "XS" || this.size == "SM") {
          this.pageSize = 10;
        }
        this.search = null;
      });
    }

  ngOnInit(): void {
    this.getAllActivities();
  }

  getAllActivities(){
    this.isLoading = true;
    forkJoin([
    this._activitiesService
    .getAllForESPRequest(this.search, this.requestId, this.pageSize, this.pageIndex, this.selectedFiltersIds)
    ,this._activitiesService
      .getCountForESPRequest(this.search, this.requestId,  this.selectedFiltersIds),
    ]).subscribe((response:any)=>{
      if(!!response){
            this.totalCount =response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            if(resp.ResponseCode ==2000){
              //start mapping
              this.lastLoadedCount = resp.ResponseResult.Activities.length;
              this.activities = !!resp.ResponseResult
                .Activities
                ? resp.ResponseResult.Activities.map((ungroupedRec:any) => {
                    return {
                      id: ungroupedRec.Id,
                      appType:  4,
                      requestId: ungroupedRec.ESP_RequestId,
                      requestName: ungroupedRec.ESP_RequestName,
                      requestNumber: ungroupedRec.ESP_RequestNumber,
                      tacticTitle: ungroupedRec.TacticTitle,
                      description: ungroupedRec.Description,
                      name: ungroupedRec.Description,
                      targetValue: ungroupedRec.TargetValue,
                      actualValue: ungroupedRec.ActualValue,
                      createdBy_UserId: ungroupedRec.CreatedBy_UserId,
                      userOwner: ungroupedRec.UserOwner,
                      score: ungroupedRec.Score,
                      dueDateLabel: this._utils.getDueDateLabel(
                        ungroupedRec.DueDate
                      ),
                      dueDate:
                        this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                        "Overdue"
                          ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                          : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                            "Due Today"
                          ? "Today"
                          : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),
                      effortInHour: Math.floor(
                        moment
                          .duration(ungroupedRec.EffortSum, "minutes")
                          .asHours()
                      ),
                      effortInMinute: Math.floor(
                        moment
                          .duration(
                            moment
                              .duration(ungroupedRec.EffortSum, "minutes")
                              .asHours() -
                              Math.floor(
                                moment
                                  .duration(ungroupedRec.EffortSum, "minutes")
                                  .asHours()
                              ),
                            "hours"
                          )
                          .asMinutes()
                      ),
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
                      maxClaims: ungroupedRec.MaxClaims,
                      totalClaims:ungroupedRec.TotalClaims,
                      owner_UserId : ungroupedRec.Owner_UserId,
                      allowedActions:
                      this._allowedActions.getAllowedActions(
                        ungroupedRec.Owner_UserId,
                        ungroupedRec.CreatedBy_UserId,
                        parseInt(this.loggedInUserId),
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
                      undefined
                    ),
                      oppProActivityType: ungroupedRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        ungroupedRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        ungroupedRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
                    };
                  })
                : [];


                this.dataLoaded = true;
                this.isError = false;
                this.isLoading = false;
                if(this.pageIndex ==1){
                  setTimeout(() => {
                    this.activitiesSubject.next(this.activities);
                  }, 500);
                }else{
                  this.activitiesSubject.next(this.activities);
                }
            }else{
              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
      }else{
        this.dataLoaded = true;
        this.isError = false;
        this.isLoading = false;
      }
    },
    (error: Error): void => {
      this.isError = true;
      this.dataLoaded = false;
      this.isLoading = false;
    });
  }

  loadMore(filter?: any, index?: number) {
    this.search == "" ? (this.search = null) : "";
      this.isLoadingMore = true;
      forkJoin([
        this._activitiesService
        .getAllForESPRequest(this.search, this.requestId, this.pageSize, this.pageIndex, this.selectedFiltersIds)
        ,this._activitiesService
          .getCountForESPRequest(this.search, this.requestId,  this.selectedFiltersIds),
        ]).subscribe((response:any)=>{
          if(!!response){
              this.totalCount =response[1].ResponseResult.ActivityCount;
              let resp = response[0];
              if (resp.ResponseCode == 2000) {
                if (resp.ResponseResult.Activities.length == 0) {
                  this.isAllUngroupedActivitiesLoaded = true;
                  this.isLoadingMore = false;
                  return;
                }

                this.tempUngroupedActivitiesArr = !!this.activities
                  ? this.activities
                  : [];

                this.lastLoadedCount = resp.ResponseResult.Activities.length;
                this.activities = !!resp.ResponseResult
                  .Activities
                  ? resp.ResponseResult.Activities.map((ungroupedRec:any) => {
                      return {
                        id: ungroupedRec.Id,
                        appType: 4,
                        requestId: ungroupedRec.ESP_RequestId,
                        requestName: ungroupedRec.ESP_RequestName,
                        requestNumber: ungroupedRec.ESP_RequestNumber,
                        tacticTitle: ungroupedRec.TacticTitle,
                        description: ungroupedRec.Description,
                        name: ungroupedRec.Description,
                        targetValue: ungroupedRec.TargetValue,
                        actualValue: ungroupedRec.ActualValue,
                        createdBy_UserId: ungroupedRec.CreatedBy_UserId,
                        userOwner: ungroupedRec.UserOwner,
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
                        isAccepted : ungroupedRec.IsAccepted ,
                        isApproved  : ungroupedRec.IsApproved ,
                        isRejected: ungroupedRec.IsRejected,
                        isShared: ungroupedRec.IsShared,
                        isImportant: ungroupedRec.IsImportant,
                        isFollowed: ungroupedRec.IsFollowed,
                      maxClaims: ungroupedRec.MaxClaims,
                      totalClaims:ungroupedRec.TotalClaims,
                      owner_UserId : ungroupedRec.Owner_UserId,
                      allowedActions:
                      this._allowedActions.getAllowedActions(
                        ungroupedRec.Owner_UserId,
                        ungroupedRec.AssignedBy_UserId,
                        parseInt(this.loggedInUserId),
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
                      undefined
                    ),
                        oppProActivityType: ungroupedRec.OppProActivityType,
                        oppProScheduleEndDate: moment(
                          ungroupedRec.OppProScheduleEndDate
                        ).format("hh:mm A"),
                        oppProScheduleStartDate: moment(
                          ungroupedRec.OppProScheduleStartDate
                        ).format("hh:mm A"),
                      };
                    })
                  : [];

                 this.activitiesSubject.next(this.activities);

                for (
                  var i = 0;
                  i < this.activities.length;
                  i++
                ) {
                  this.tempUngroupedActivitiesArr.push(
                    this.activities[i]
                  );
                }

                this.activities = this.tempUngroupedActivitiesArr;

                this.dataLoaded = true;
                this.isError = false;
                this.isLoadingMore = false;

              } else {
                this._alertService.error(resp.ResponseMessage, {
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

  onPageChange(ev:any, filter?: any, index?: number){
          this.pageIndex=ev.pageIndex+1;
          this.loadMore(filter, index);
  }

  reload(ev:any){
    if (ev == true) {
      this.getAllActivities();
      this.onReload.emit(ev);
    }
  }


  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
    this.getAllActivities();
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
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
            if (!this.isAllUngroupedActivitiesLoaded) {
              this.pageIndex++;
              // this.loadMore(this.selectedFiltersIds);
            }

        }
      }
    }
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
    this.lastLoadedCount =0;
  }

  openFiltersDialog(): void {
    this.isFiltersDialogOpened = true;
    this.resetToDefualt();

    const dialogRef = this._dialog.open(FiltersDialog, {
      //width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",

      width:'55%',
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      //maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      //maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        type: this.activeTab,
        selected: this.selectedFilters,
        isESPcomponent:true
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.selectedFiltersIds = result.ids;
        this.selectedFilters = result.objs.length > 0 ? result.objs : [];
        this.isDefultFilterApplied = result.isDefault;
        this.reload(true);
      }
    });
  }

  onFilterClose(filter:any) {
    this.removeSelectedItems(filter);
    this.getAllActivities();
  }

  removeSelectedItems(filter:any) {
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
                (selectedFilter:any) => selectedFilter !== filter.id
              );
            }
            break;
          case "team":
            for (var j = 0; j < this.selectedFiltersIds.TeamIds.length; j++) {
              this.selectedFiltersIds.TeamIds = this.selectedFiltersIds.TeamIds.filter(
                (selectedFilter:any) => selectedFilter !== filter.id
              );
            }
            break;
          case "tactic":
            for (var j = 0; j < this.selectedFiltersIds.TacticIds.length; j++) {
              this.selectedFiltersIds.TacticIds = this.selectedFiltersIds.TacticIds.filter(
                (selectedFilter:any) => selectedFilter !== filter.id
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
                (selectedFilter:any) => selectedFilter !== filter.id
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
    this.getAllActivities();
  }
  openCreateDialog(formMode: string, formType: string): void {

    // this._dialog.open(TestDialog, {
    //   //width: "460px"
    // });
    this.resetToDefualt();

      const dialogRef = this._dialog.open(ActivityDialog, {
width:'50%',
        data: {
          isMine: true,
          formMode: formMode,
          isEspEnabled:true,
          isESPcomponent:true,
          requestId:this.requestId,
          isFromAllActivities: true
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.reload(true);
      });

  }

  openActivityDetails(row: Activity) {
    let queryParams:{
      accessedFrom:any,
        preTab:any ,
        isESPcomponent:any,
        moduleName:any,
        requestName:any,
        my:any
    }
    = {
        accessedFrom: 'list',
        preTab:StemeXeListType.Mine,
        isESPcomponent:true,
        moduleName:this.requestModuleName,
        requestName:this.requestName,
        my:this.isMyspace
    };

    this._router.navigate([`pages/activities/details/${row.id}`],{queryParams});

  }

}
