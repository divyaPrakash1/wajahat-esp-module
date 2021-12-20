import {
  Component,
  OnInit,
  Input,
  ViewChild,
  HostListener,
  ElementRef,
} from "@angular/core";
import { ActivitiesService } from "../../services/activities.service";
import { ActivitiesByGroup } from "../../models/activities-by-group";

import {
  StemeXeGroupType,
  StemeXeListType,
  Actions,
} from "../../enums";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivityUtilsService } from "../../../shared/utils-activity.service";
import * as moment from "moment";
import { delay } from "rxjs/operators";
import { Router } from "@angular/router";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
// import { SimplestrataAuthService } from "../../../shared/services/simplestrata-auth-activity.service";
import { MatDialog } from "@angular/material/dialog";
import { Activity } from "../../models/activity";
import { forkJoin, Subject } from "rxjs";
import { Addon } from "../../../shared/models/addon.model-activity";
import { AllowedActionsService } from "../../services/allowed-actions.service";
import { EpmSettingsDialogComponent } from "../../dialogs/epm-settings-dialog/epm-settings-dialog.component";
import { RejectMultipleDialogComponent } from "../../dialogs/reject-multiple-dialog/reject-multiple-dialog.component";
import { RevokeDialogComponent } from "../../dialogs/revoke-dialog/revoke-dialog.component";
import { SignatureFilterDialog } from "../../dialogs/signature-filter-dialog/signature-filter-dialog.component";
import { SimplestrataAuthService } from "src/app/activities/shared/services/simplestrata-auth.service";
// import { SimplestrataAuthService } from "src/app/shared/services/simplestrata-auth.service";

@Component({
  selector: "xcdrs-signed-activities",
  templateUrl: "./signed-activities.component.html",
  styleUrls: ["./signed-activities.component.scss"],
})
export class SignedActivitiesComponent implements OnInit {
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
  isEpmConnected: boolean = !!localStorage.getItem("epmConnectuionData")
    ? true
    : false;
  groupByAppliedFilter: number = StemeXeGroupType.None;

  size: string;
  loggedInUserId: any;
  selectedFiltersIds: any = {
    IsFollowed: true,
    IsImportant: false,
    StatusIds: [],
  };
  selectedFilters: Array<any> = [];
  isListViewActive: boolean = true;
  pageIndex: number = 1;
  pageSize: number = 10; //10000;
  totalCount: number = 0;
  lastLoadedCount: number = 0;
  isAllUngroupedActivitiesLoaded: boolean = false;
  tempUngroupedActivitiesArr: Array<any> = new Array();
  tempGroupedActivitiesArr: Array<any> = new Array();
  isAllGroupActivitiesLoaded: Array<boolean> = new Array();
  @Input() isEngProEnabled: boolean = false;
  @Input() engProLoggedInUserId: string = '';
  @Input() engProUsers: Array<any> = [];
  @Input() engProTeams: Array<any> = [];
  @Input() isOppProEnabled: boolean = false;
  @Input() oppProData: any = null;

  @Input() isEspEnabled: boolean = false;
  @Input() espAddon: Addon = null;
  activitiesSubject: Subject<Activity[]> = new Subject<Activity[]>();
  tableList: Activity[] = [];
  @ViewChild("scrollableContainer")
  scrollableContainer: ElementRef;

  activeTab: number = StemeXeListType.Signed;
  isFiltersDialogOpened: boolean = false;

  allSelectedActivity: any[] = [];
  isAnyActivitySigned:boolean = false;
  isArabic: boolean = false;
  constructor(
    private _activitiesService: ActivitiesService,
    private _resizeService: ActivityResizeService,
    private _router: Router,
    private _utils: ActivityUtilsService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    private _allowedActions: AllowedActionsService
  ) {
    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;
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
    this.loadUngroupedActivities(this.selectedFiltersIds);
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  loadUngroupedActivities(filter?: any) {
    this.search == "" ? (this.search = null) : "";
    this.isLoading = true;
    forkJoin([
      this._activitiesService.getAllSigned(
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
      this._activitiesService.getCountForSigned(
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
      (response: any) => {
        if (!!response) {
          this.totalCount = response[1].ResponseResult.ActivityCount;
          let resp = response[0];
          if (resp.ResponseCode == 2000) {
            this.allSelectedActivity = [];
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
            } else {
              this.activitiesByGroup.weekDays = null;
            }

            this.activitiesByGroup.newAssigned = !!resp.ResponseResult
              .NewAssigned
              ? resp.ResponseResult.NewAssigned.map((newAssignedRec) => {
                  return {
                    id: newAssignedRec.Id,
                    appType:
                      newAssignedRec.ESP_RequestId != null
                        ? 4
                        : newAssignedRec.AppType,
                    requestId: newAssignedRec.ESP_RequestId,
                    requestName: newAssignedRec.ESP_RequestName,
                    requestNumber: newAssignedRec.ESP_RequestNumber,
                    tacticTitle: newAssignedRec.TacticTitle,
                    description: newAssignedRec.Description,
                    targetValue: newAssignedRec.TargetValue,
                    actualValue: newAssignedRec.ActualValue,
                    createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                    score: newAssignedRec.Score,
                    dueDate: moment(newAssignedRec.DueDate).format(
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
                  return {
                    id:
                      ungroupedRec.AppType == 3
                        ? ungroupedRec.EpmInfo.TaskId
                        : ungroupedRec.Id,
                    epmInfo: ungroupedRec.EpmInfo,
                    appType:
                      ungroupedRec.ESP_RequestId != null
                        ? 4
                        : ungroupedRec.AppType,
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
                        ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                        : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                          "Due Today"
                        ? "Today"
                        : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),
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
                        ? "#8795b1"
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
                    owner: ungroupedRec.CreatedBy
                      ? `${ungroupedRec.CreatedBy.UserFirstName} ${ungroupedRec.CreatedBy.UserLastName}`
                      : null,
                    allowedActions:
                      this._allowedActions.getAllowedActionForSignature(
                        Actions.sign, ungroupedRec.IsRejected
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
  }

  loadLess(filter?: any, group?: any, index?: number) {
    if (this.groupByAppliedFilter == StemeXeGroupType.None) {
      this.isLoadingMore = true;
      this.activitiesByGroup.ungrouped =
        this.activitiesByGroup.ungrouped.splice(
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
      this.activitiesByGroup.groups[index].groupList =
        this.activitiesByGroup.groups[index].groupList.splice(
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
    this.search == "" ? (this.search = null) : "";
    if (this.groupByAppliedFilter == StemeXeGroupType.None) {
      this.isLoadingMore = true;
      forkJoin([
        this._activitiesService.getAllSigned(
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
        this._activitiesService.getCountForSigned(
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
              this.allSelectedActivity = [];
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
                        ungroupedRec.ESP_RequestId != null
                          ? 4
                          : ungroupedRec.AppType,
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
                          ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                          : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                            "Due Today"
                          ? "Today"
                          : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),
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
                          ? "#8795b1"
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
                      allowedActions: this._allowedActions.getAllowedActionForSignature(Actions.sign, ungroupedRec.IsRejected),
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

              this.activitiesByGroup.ungrouped =
                this.tempUngroupedActivitiesArr;

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
        this._activitiesService.getAllSigned(
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

        this._activitiesService.getCountForSigned(
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
              this.allSelectedActivity = [];
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
                        listRec.ESP_RequestId != null ? 4 : listRec.AppType,
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
                          ? "#8795b1"
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
                      allowedActions: this._allowedActions.getAllowedActionForSignature(Actions.sign, listRec.IsRejected),
                      oppProActivityType: listRec.OppProActivityType,
                      oppProScheduleEndDate: moment(
                        listRec.OppProScheduleEndDate
                      ).format("hh:mm A"),
                      oppProScheduleStartDate: moment(
                        listRec.OppProScheduleStartDate
                      ).format("hh:mm A"),
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

              this.activitiesByGroup.groups[index].groupList =
                this.tempGroupedActivitiesArr[index];

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

  activityAction() {
    console.log("activty needs action");
  }

  selectedActivity(ev) {
    this.allSelectedActivity = ev;
    this.allSelectedActivity.map((obj) => {
      if(obj.isRejected) {
        this.isAnyActivitySigned = true;
      }
    });
    console.log("activty needs action", ev);
  }

  reloadLists(
    search: string,
    groupByAppliedFilter: number,
    filter?: any,
    group?: any
  ) {
    //this.search == "" ? (this.search = null) : "";
    this.isReloadingList = true;
    this.listReloaded = false;
    this.activitiesByGroup.groups = [];
    this.activitiesByGroup.ungrouped = [];
    if (groupByAppliedFilter == StemeXeGroupType.None) {
      forkJoin([
        this._activitiesService.getAllSigned(
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
        this._activitiesService.getCountForSigned(
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
      ]).subscribe(
        (response) => {
          if (!!response) {
            this.totalCount = response[1].ResponseResult.ActivityCount;
            let resp = response[0];
            this.allSelectedActivity = [];
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
              } else {
                this.activitiesByGroup.weekDays = null;
              }

              this.activitiesByGroup.newAssigned = !!resp.ResponseResult
                .NewAssigned
                ? resp.ResponseResult.NewAssigned.map((newAssignedRec) => {
                    return {
                      id: newAssignedRec.Id,
                      appType:
                        newAssignedRec.ESP_RequestId != null
                          ? 4
                          : newAssignedRec.AppType,
                      requestId: newAssignedRec.ESP_RequestId,
                      requestName: newAssignedRec.ESP_RequestName,
                      requestNumber: newAssignedRec.ESP_RequestNumber,
                      tacticTitle: newAssignedRec.TacticTitle,
                      description: newAssignedRec.Description,
                      targetValue: newAssignedRec.TargetValue,
                      actualValue: newAssignedRec.ActualValue,
                      createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                      score: newAssignedRec.Score,
                      dueDate: moment(newAssignedRec.DueDate).format(
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
                        ungroupedRec.ESP_RequestId != null
                          ? 4
                          : ungroupedRec.AppType,
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
                          ? this._utils.getDueDateTimeAgo(ungroupedRec.DueDate)
                          : this._utils.getDueDateLabel(ungroupedRec.DueDate) ==
                            "Due Today"
                          ? "Today"
                          : moment(ungroupedRec.DueDate).format("DD MMM YYYY"),
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
                          ? "#8795b1"
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
                      allowedActions:
                        this._allowedActions.getAllowedActionForSignature(
                          Actions.sign, ungroupedRec.IsRejected
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

              if (this.isFiltersDialogOpened) {
                setTimeout(() => {
                  this.isFiltersDialogOpened = false;
                }, 500);
              }
              this.listReloaded = true;
              this.isReloadingList = false;
              this.isError = false;
              setTimeout(() => {
                this.activitiesSubject.next(this.activitiesByGroup.ungrouped);
              }, 500);
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
    this.reloadLists(
      this.search,
      this.groupByAppliedFilter,
      this.selectedFiltersIds
    );
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

  openEPMSettingsDialog(): void {
    const dialogRef = this._dialog.open(EpmSettingsDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        isEpmConnected: this.isEpmConnected,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isEpmConnected = result;
      this.reloadLists(
        this.search,
        this.groupByAppliedFilter,
        this.selectedFiltersIds
      );
    });
  }

  resetToDefualt() {
    this.selectedFiltersIds = {
      IsFollowed: true,
      IsImportant: false,
      StatusIds: [],
    };
    this.pageIndex = 1;
    this.pageSize = 10;
    this.tempUngroupedActivitiesArr = [];
    this.search = null;
    this.lastLoadedCount = 0;
  }

  openFiltersDialog(): void {
    this.isFiltersDialogOpened = true;
    // this.resetToDefualt();

    const dialogRef = this._dialog.open(SignatureFilterDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        type: this.activeTab,
        notShowSigned:true,
        selected: this.selectedFilters,
        selectedFiltersIds:this.selectedFiltersIds,
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



  rejectAll() {
    const dialogRef = this._dialog.open(RejectMultipleDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activity: this.allSelectedActivity,
        engProLoggedInUserId: this.engProLoggedInUserId,
        type: "closed",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadUngroupedActivities(this.selectedFiltersIds);
    });
  }

  revokeAll() {
    const dialogRef = this._dialog.open(RevokeDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "416px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      //maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activity: this.allSelectedActivity,
        engProLoggedInUserId: this.engProLoggedInUserId,
        type: "closed",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      //this.reload.emit(true);
      this.loadUngroupedActivities(this.selectedFiltersIds);
    });
  }
}
