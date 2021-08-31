import { Component, OnInit } from "@angular/core";
import { ActivitiesService } from "../../services/activities.service";
import { ActivatedRoute } from "@angular/router";
import { delay } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
// import { Activity } from "app/esp-activity-module/models/activity";
// import { Addon } from "app/esp-activity-module/models/addon.model";
// import { SimplestrataAuthService } from "app/esp-activity-module/services/simplestrata-auth.service";
// import { ResizeService } from "app/esp-activity-module/services/resize.service";
// import { UtilsService } from "app/esp-activity-module/services/utils.service";
// import { AlertService } from "app/esp-activity-module/alert/alert.service";
// import { AllowedActionsService } from "app/esp-activity-module/services/allowed-actions.service";
import { MatDialog } from "@angular/material/dialog";
// import { SCREEN_SIZE } from "app/esp-activity-module/enums/shared.enums";
// import { Conditions, Definitions, EntityTypes, StemeXeListType } from "app/esp-activity-module/enums/enums";
// import { Tactic } from "app/esp-activity-module/models/tactic";
// import { Category } from "app/esp-activity-module/models/category";
import { LogDialog } from "../dialogs/log-dialog/log-dialog";
// import { AttachmentsService } from "app/esp-activity-module/services/attachments.service";
// import { CommentsService } from "app/esp-activity-module/services/comments.service";
import { ShareWithUsersDialogComponent } from "../dialogs/share-with-users-dialog/share-with-users-dialog.component";
import { Activity } from "../../../esp-activity-module/models/activity";
import { Addon } from "esp-activity-module/models/addon.model";
import { SimplestrataAuthService } from "../../../esp-activity-module/services/simplestrata-auth.service";
import { ResizeService } from "../../../esp-activity-module/services/resize.service";
import { UtilsService } from "../../../esp-activity-module/services/utils.service";
import { AttachmentsService } from "esp-activity-module/services/attachments.service";
import { AlertService } from "../../../esp-activity-module/alert/alert.service";
import { CommentsService } from "esp-activity-module/services/comments.service";
import { AllowedActionsService } from "esp-activity-module/services/allowed-actions.service";
import { SCREEN_SIZE } from "../../../esp-activity-module/services/shared.enums";
import { Conditions, Definitions, EntityTypes, StemeXeListType } from "../../../esp-activity-module/enums/enums";
import { Tactic } from "../../../esp-activity-module/models/tactic";
import { Category } from "../../../esp-activity-module/models/category";

@Component({
  selector: "xcdrs-activity-details",
  templateUrl: "./activity-details.component.html",
  styleUrls: ["./activity-details.component.scss"],
})
export class ActivityDetailsComponent implements OnInit {
  isLoading: boolean = false;
  isLoadingAttachment: boolean = false;
  isLoadingComment: boolean = false;
  isLoadingEffort: boolean = false;
  isLoadingNote: boolean = false;
  isError: boolean = false;
  dataLoaded: boolean = false;
  noteInEditMode: boolean = false;
  size?: string;
  activityId: string;
  note?: any;
  comment?: any;
  activity?: Activity;
  oppProActivity: any;
  show: boolean = false;
  effortIndex?: number;
  activityArr?: Array<any>;
  activityDataSource: any = null;
  canLogActual: boolean = false;
  canAppened: boolean = false;
  canEdit: boolean = false;
  canRead: boolean = false;
  loggedInUserId: any;
  displayedColumns: Array<string> = [];
  rejectionReason?: string = '';
  isEngProActivity: any = false;
  isOppProActivity: any = false;
  isEngProEnabled: boolean = false;
  isEngProDataLoaded: boolean = false;
  engProLoggedInUserId: any = null;
  isOppProEnabled: boolean = false;
  isOppProDataLoaded: boolean = false;
  oppProData: any = null;
  isEspEnabled: boolean = false;
  isEspAddonLoaded: boolean = false;
  // isEspResquestActivity: boolean = false;
  espAddon?: Addon;

  isAccessedFromStacked: boolean = false;
  isAccessedFromShared: boolean = false;

  isClaimed?: boolean;
  accessedFrom: any = null;
  listType: any = null;
  listLength?: number;
  preTab: any = null;
  innerPreTab: any = null;
  isESPcomponent: boolean = false;
  requestName?: string = '';
  moduleName?: string = 'null';
  isMyspace: boolean = false;
  isEpmActivity: boolean;
  parentProjectId: any;
  taskId: any;
  conversationId: any = null;
  textSizeRatio:number = 2.5;
  constructor(
    private _activitiesService: ActivitiesService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _resizeService: ResizeService,
    private _actRoute: ActivatedRoute,
    private _utils: UtilsService,
    private _attachmentsService: AttachmentsService,
    private _alertService: AlertService,
    private _commentsService: CommentsService,
    private _allowedActions: AllowedActionsService,
    public _dialog: MatDialog
  ) {

    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });

    this.activityId = this._actRoute.snapshot.params.id;

    this.isEngProActivity =
      !!this._actRoute.snapshot.params.activityType &&
        this._actRoute.snapshot.params.activityType == "engProAct"
        ? true
        : false;

    this.isOppProActivity =
      !!this._actRoute.snapshot.params.activityType &&
        this._actRoute.snapshot.params.activityType == "oppProAct"
        ? true
        : false;

    this.isEpmActivity =
      !!this._actRoute.snapshot.params.activityType &&
        this._actRoute.snapshot.params.activityType == "epmAct"
        ? true
        : false;
    if (this.isEpmActivity) {
      this.parentProjectId = this._actRoute.snapshot.params.parentProjectId;
      this.taskId = this._actRoute.snapshot.params.id;
    }
    this.initBreadCrumb();

  }

  ngOnInit(): void {
    this.initDetails();
  }

  initBreadCrumb() {
    this.accessedFrom = this._actRoute.snapshot.queryParams['accessedFrom'];
    switch (this.accessedFrom) {
      case 'msgs':
        this.preTab = null;
        this.conversationId = this._actRoute.snapshot.queryParams['conversationId'];
        break;
      case 'user':
      case 'shared':
        this.preTab = StemeXeListType.Following;
        this.accessedFrom == 'user' ? this.innerPreTab = this._actRoute.snapshot.queryParams['innerPreTab'] : "";
        break;
      case 'carousel':
      case 'carousel-details':
        this.listType = this._actRoute.snapshot.queryParams['listType'];
        this.preTab = this.listType == 'assigned' ?
          StemeXeListType.Mine : StemeXeListType.Following;
        this.accessedFrom == 'carousel-details' ?
          this.listLength = this._actRoute.snapshot.queryParams['listLength'] : "";
        break;
      default://list
        this.preTab = !!this._actRoute.snapshot.queryParams['preTab'] ? parseInt(this._actRoute.snapshot.queryParams['preTab']) : null;
        this.innerPreTab = !!this._actRoute.snapshot.queryParams['innerPreTab'] ? parseInt(this._actRoute.snapshot.queryParams['innerPreTab']) : null;
        this.isESPcomponent = !!this._actRoute.snapshot.queryParams['isESPcomponent'] && this._actRoute.snapshot.queryParams['isESPcomponent'] == "true" ? true : false;
        if (this.isESPcomponent) {
          this.requestName = !!this._actRoute.snapshot.queryParams['requestName'] ? this._actRoute.snapshot.queryParams['requestName'] : null;
          this.moduleName = !!this._actRoute.snapshot.queryParams['moduleName'] ? this._actRoute.snapshot.queryParams['moduleName'] : null;
          this.isMyspace = !!this._actRoute.snapshot.queryParams['my'] ? this._actRoute.snapshot.queryParams['my'] : null;
        }
        break;
    }
  }

  initDetails() {
    this._actRoute.data.subscribe((data) => {
      if (!!data) {
        if (!!data.engProData) {
          if (data.engProData.code == "001" && !!data.engProData.result) {
            this.engProLoggedInUserId = data.engProData.result.userId;
            this.isEngProEnabled = true;
          }
          this.isEngProDataLoaded = true;
        } else {
          this.isOppProDataLoaded = true;
        }

        if (!!data.espAddon) {
          this.espAddon = data.espAddon;
          this.isEspEnabled = true;
          this.isEspAddonLoaded = true;

        } else {
          this.isEspAddonLoaded = true;
        }

        if (!!data.oppProData) {
          if (data.oppProData.code == "001" && !!data.oppProData.result) {
            this.oppProData = data.oppProData.result;
            this._activitiesService?.getUserInfoForStemexe(this.oppProData)?.subscribe((resp:any) => {
                if (!!resp) {
                  this.oppProData.user = resp.result;
                  this.oppProData.accessToken =
                    data.oppProData.result.access_token;
                }
              });
            this.isOppProEnabled = true;
          }
          this.isOppProDataLoaded = true;
        } else {
          this.isOppProDataLoaded = true;
        }

        if (this.isEngProDataLoaded && this.isOppProDataLoaded) {
          if (!this.isOppProActivity) {
            this.getDetails(this.activityId);
          } else {
            this.getOppProDetails(this.activityId);
          }
        }
      } else {
        this.getDetails(this.activityId);
        this.isEngProDataLoaded = true;
        this.isOppProDataLoaded = true;
      }
    });

  }

  getDetails(activityId: string) {
    this.isLoading = true;
    this._activitiesService
      .getActivityDetails(
        activityId,
        this.engProLoggedInUserId,
        this.isEngProActivity,
        this.isEpmActivity,
        this.parentProjectId,
        this.taskId
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp?.ResponseCode == 2000) {
            let preURL = localStorage.getItem('preURL');
            if (!!preURL && preURL != null) {
              if (preURL == "/pages/activities" || preURL == "/pages/activities/new/assigned") {
                this.isAccessedFromStacked = true;
                this.isAccessedFromShared = false;
              } else {
                this.isAccessedFromStacked = false;
                this.isAccessedFromShared = true;
              }
            } else {
              this.isAccessedFromStacked = false;
              this.isAccessedFromShared = false;
            }
            this.activity = new Activity();
            this.activity.activityType = "task";
            this.activity.id = resp.ResponseResult.Id;
            this.activityId = this.activity.id.toString();
            this.activity.epmInfo = resp.ResponseResult.EpmInfo;
            this.activity.appType = this.isEpmActivity ? 3 : this.isEngProActivity ? 1 : resp.ResponseResult.ESP_RequestId != null ? 4 : 0;
            this.activity.requestId = resp.ResponseResult.ESP_RequestId;
            this.activity.tacticLabelText = resp.ResponseResult.TacticLabelText;
            this.activity.tacticsLabelText =
              resp.ResponseResult.TacticsLabelText;
            this.activity.description = resp.ResponseResult.Description;
            this.activity.targetValue = resp.ResponseResult.TargetValue;
            this.activity.actualValue = resp.ResponseResult.ActualValue;
            this.activity.createdBy_UserId =
              resp.ResponseResult.CreatedBy_UserId;
            this.activity.score = resp.ResponseResult.Score;


            this.activity.progressStatus = resp.ResponseResult.IsRejected
              ? "Rejected"
              : (resp.ResponseResult.AppType != 2 &&
                resp.ResponseResult.Status == 4 &&
                !resp.ResponseResult.IsReassigned) ||
                (resp.ResponseResult.AppType == 2 &&
                  resp.ResponseResult.OppProStatus == "Cancelled")
                ? "Cancelled"
                : resp.ResponseResult.AppType != 2 &&
                  resp.ResponseResult.Status == 4 &&
                  resp.ResponseResult.IsReassigned
                  ? "Reassigned"
                  : (resp.ResponseResult.AppType != 2 && resp.ResponseResult.Status == 2) ||
                    (resp.ResponseResult.AppType == 2 &&
                      (resp.ResponseResult.OppProStatus == "Completed" ||
                        resp.ResponseResult.OppProStatus == "Sent"))
                    ? "Done"
                    : resp.ResponseResult.ActualValue == null && resp.ResponseResult.AppType != 2
                      ? "Not Started"
                      : resp.ResponseResult.AppType == 2 &&
                        (resp.ResponseResult.OppProStatus == "Planned" ||
                          resp.ResponseResult.OppProStatus == null)
                        ? "Planned"
                        : "In progress",
              // this.activity.progressStatus = resp.ResponseResult.IsRejected
              //   ? "Rejected"

              //   : resp.ResponseResult.Status == 4 &&
              //     !resp.ResponseResult.IsReassigned
              //   ? "Cancelled"
              //   : resp.ResponseResult.Status == 4 &&
              //     resp.ResponseResult.IsReassigned
              //   ? "Reassigned"
              //   : resp.ResponseResult.Status == 2
              //   ? "Done"
              //   : resp.ResponseResult.ActualValue == null && !resp.ResponseResult.IsAccepted
              //   ? "Not Started"
              //   // : resp.ResponseResult.ActualValue == null && !resp.ResponseResult.IsAccepted && this.loggedInUserId == resp.ResponseResult.Owner_UserId
              //   // ? "Not Accepted"
              //   : "In progress";
              this.activity.progressStatusColor = resp.ResponseResult.IsRejected
                ? "#EB487F"
                : resp.ResponseResult.Status == 4
                  ? "#EB487F"
                  : resp.ResponseResult.Status == 2
                    ? "#33BA70"
                    : resp.ResponseResult.ActualValue == null
                      ? "#8795b1"
                      : "#00a3ff";
            this.activity.dueDate = resp.ResponseResult.DueDate != ''
                ? moment(resp.ResponseResult.DueDate).format("DD MMM YYYY")
                : '';
            this.activity.DueDate =
              resp.ResponseResult.DueDate != null
                ? resp.ResponseResult.DueDate
                : null;
            this.activity.effortSum = resp.ResponseResult.EffortSum;
            this.activity.effortInHour = Math.floor(
              moment
                .duration(resp.ResponseResult.EffortSum, "minutes")
                .asHours()
            );
            //resp.ResponseResult.EffortInHour;
            this.activity.effortInMinute = Math.floor(
              moment
                .duration(
                  moment
                    .duration(resp.ResponseResult.EffortSum, "minutes")
                    .asHours() -
                  Math.floor(
                    moment
                      .duration(resp.ResponseResult.EffortSum, "minutes")
                      .asHours()
                  ),
                  "hours"
                )
                .asMinutes()
            ); //resp.ResponseResult.EffortInMinute;
            this.activity.unit = resp.ResponseResult.Unit;
            this.activity.weight = resp.ResponseResult.Weight;
            this.activity.isPlanned = resp.ResponseResult.IsPlanned;

            this.activity.parentBoardId = resp.ResponseResult.ParentBoardId;
            this.activity.parentBoardName = resp.ResponseResult.ParentBoardName;
            this.activity.status = resp.ResponseResult.Status;
            this.activity.createdBy = resp.ResponseResult.CreatedBy;

            this.activity.creationDate =
              resp.ResponseResult.CreationDate != ''
                ? moment(resp.ResponseResult.CreationDate).format("DD MMM YYYY")
                : '';
            this.activity.reminder = resp.ResponseResult.Reminder;
            //this.activity.checkPoint = resp.ResponseResult.CheckPoint;
            this.activity.checkPointId =
              resp.ResponseResult.CheckPoint_CheckPointId;
            this.activity.tacticId = resp.ResponseResult.Tactic_TacticId;
            if (this.activity.tacticId != null) {
              this.activity.tactic = new Tactic();
              this.activity.tactic.id = this.activity.tacticId;
              this.activity.tactic.title =
                resp.ResponseResult.Tactic.TacticTitle;

              if (
                resp.ResponseResult.Tactic.TacticCategory_CategoryId != null
              ) {
                this.activity.tactic.category = new Category();
                if (!!resp.ResponseResult.Tactic.category) {
                  this.activity.tactic.category.id =
                    resp.ResponseResult.Tactic.category.Id;
                  this.activity.tactic.category.text =
                    resp.ResponseResult.Tactic.category.Text;
                }
              }

              this.activity.tactic.unit = resp.ResponseResult.Tactic.Unit;
              this.activity.tactic.tags = !!resp.ResponseResult.Tactic.tags
                ? resp.ResponseResult.Tactic.tags.map((tag:any) => {
                  return {
                    id: tag.Id,
                    text: tag.Text,
                    color: tag.color,
                    organizationId: tag.Organization_OrganizationId,
                    // organization: null,
                    CreatedBy_UserId: tag.CreatedBy_UserId,
                    createdBy: tag.CreatedBy,
                    isDeleted: tag.IsDeleted,
                    creationDate: tag.CreationDate,
                    isChecked: tag.IsChecked,
                  };
                })
                : [];

              //this.activity.tactic.weight=resp.ResponseResult.Tactic.Weight;
              this.activity.tactic.condition =
                resp.ResponseResult.Tactic.condition == Conditions.Equal
                  ? "Equal"
                  : resp.ResponseResult.Tactic.condition == Conditions.LessThan
                    ? "Less Than"
                    : "More Than";
              this.activity.tactic.definition =
                resp.ResponseResult.Tactic.definition == Definitions.Average
                  ? "Average"
                  : resp.ResponseResult.Tactic.definition == Definitions.Last
                    ? "Last"
                    : "Sum";
            } else {
              this.activity.condition =
                resp.ResponseResult.Condition == Conditions.Equal
                  ? "Equal"
                  : resp.ResponseResult.Condition == Conditions.LessThan
                    ? "Less Than"
                    : "More Than";
            }

            this.activity.commentCount = resp.ResponseResult.CommentCount;

            this.activity.isCascading =
              resp.ResponseResult.IndicatorIsCascading;
            this.activity.labelGroupId = resp.ResponseResult.LabelGroupId;
            this.activity.cascadeTacticParentName =
              resp.ResponseResult.CascadeTacticParentName;
            this.activity.owner_UserId = resp.ResponseResult.Owner_UserId;
            this.activity.userOwner = resp.ResponseResult.UserOwner;
            this.activity.fieldCount = resp.ResponseResult.FieldCount;
            this.activity.attachmentCount = resp.ResponseResult.AttachmentCount;
            this.activity.isSigned = resp.ResponseResult.IsSigned;
            this.activity.assignedBy_UserId =
              resp.ResponseResult.AssignedBy_UserId;
            this.activity.assignedBy = resp.ResponseResult.AssignedBy;
            this.activity.relationCount = resp.ResponseResult.RelationCount;
            this.activity.isLocked = resp.ResponseResult.IsLocked;
            this.activity.isFollowed = resp.ResponseResult.IsFollowed;
            this.activity.isImportant = resp.ResponseResult.IsImportant;
            this.activity.isAccepted = resp.ResponseResult.IsAccepted;
            this.activity.isApproved = resp.ResponseResult.IsApproved;
            this.activity.completedDate =
              resp.ResponseResult.CompletedDate != ''
                ? moment(resp.ResponseResult.CompletedDate).format(
                  "DD MMM YYYY"
                )
                : '';
            this.activity.completedDateAsDate = new Date(
              resp.ResponseResult.CompletedDate
            );
            this.activity.note = resp.ResponseResult.Note;
            this.activity.history = resp.ResponseResult.History.map(
              (history:any) => {
                return {
                  // actionId: history.Action,
                  action:
                    history.Action == 0
                      ? "created"
                      : history.Action == 1
                        ? "updated"
                        : history.Action == 2
                          ? "deleted"
                          : "moved",
                  changeDate:
                    history.ChangeDate != null
                      ? moment(history.ChangeDate).format("DD MMM YYYY")
                      : null,
                  changeTime:
                    history.ChangeDate != null
                      ? moment(history.ChangeDate).format("hh:mm A")
                      : null,
                  fieldName: history.FieldName,
                  fieldType: history.FieldType,
                  newValue: history.NewValue,
                  originalValue: history.OriginalValue,
                  user: history.User,
                  userId: history.UserId,
                };
              }
            );
            this.activity.respEfforts = resp.ResponseResult.Efforts;
            this.activity.efforts = resp.ResponseResult.Efforts.map(
              (effort:any) => {
                return {
                  showLongComment: false,
                  creationDate:
                    effort.CreationDate != null
                      ? moment(effort.CreationDate).format("DD MMM YYYY")
                      : null,
                  endTime: effort.EndTime != null ? moment(effort.EndTime).format("hh:mm a") : null,
                  // endTime:
                  //   effort.EndTime != null
                  //     ? moment
                  //         .utc(effort.EndTime)
                  //         .local()
                  //         .format("hh:mm a")
                  //         .replace(/\s/g, "")
                  //     : null,
                  endTimeDate:
                    effort.EndTime != null
                      ? moment.utc(effort.EndTime).local().format("LLL")
                      : null,
                  hours: effort.Hours,
                  id: effort.Id,
                  minutes: effort.Minutes,
                  note: effort.Note,
                  startTime: effort.StartTime != null ? moment(effort.StartTime).format("hh:mm a") : null,
                  // startTime:
                  //   effort.StartTime != null
                  //     ? moment
                  //         .utc(effort.StartTime)
                  //         .local()
                  //         .format("hh:mm a")
                  //         .replace(/\s/g, "")
                  //     : null,
                  startTimeDate:
                    effort.StartTime != null
                      ? moment.utc(effort.StartTime).local().format("LLL")
                      : null,
                  completedDate:
                    effort.CompletedDate != null
                      ? moment(effort.CompletedDate).format("DD MMM YYYY")
                      : null,
                };
              }
            );
            this.activity.reassignReason = resp.ResponseResult.re
            this.activity.tags = resp.ResponseResult.Tags.map((tag:any) => {
              return {
                id: tag.Id,
                text: tag.Text,
                color: tag.color,
                organizationId: tag.Organization_OrganizationId,
                // organization: null,
                CreatedBy_UserId: tag.CreatedBy_UserId,
                createdBy: tag.CreatedBy,
                isDeleted: tag.IsDeleted,
                creationDate: tag.CreationDate,
                isChecked: tag.IsChecked,
              };
            });
            this.activity.respAttachments = resp.ResponseResult.Attachments
            console.log
            this.activity.attachments = resp.ResponseResult.Attachments.map(
              (attachment:any) => {
                return {
                  id: attachment.Id,
                  name: attachment.Name.substr(
                    0,
                    attachment.Name.lastIndexOf(".")
                  ),
                  size: attachment.SizeInKB,
                  fileUrl: attachment.FileUrl,
                  type: 
                    attachment.fileType === 0
                      ? "jpg"
                      : attachment.fileType === 1
                        ? "jpeg"
                        : attachment.fileType === 2
                          ? "png"
                          : attachment.fileType === 3
                            ? "gif"
                            : attachment.fileType === 4
                              ? "doc"
                              : attachment.fileType === 5
                                ? "docx"
                                : attachment.fileType === 6
                                  ? "xls"
                                  : attachment.fileType === 7
                                    ? "xlsx"
                                    : attachment.fileType === 8
                                      ? "pdf"
                                      : attachment.fileType === 13
                                        ? "ppt"
                                        : attachment.fileType === 14
                                          ? "pptx"
                                          : //  attachment.fileType === 9 ? 'mp3' :
                                          // attachment.fileType === 10 ? 'wav' :
                                          // attachment.fileType === 11 ? 'mp4' :
                                          // attachment.fileType === 12? 'xwav' :

                                          "unknown",
                };
              }
            );
            this.activity.comments = resp.ResponseResult.Comments.map(
              (comment:any) => {
                return {
                  id: comment.Id,
                  text: comment.Text,
                  activityId: comment.Indicator_IndicatorId,
                  createdBy_UserId: comment.CreatedBy_UserId,
                  createdBy: {
                    FirstName: comment.createdBy.FirstName,
                    LastName: comment.createdBy.LastName,
                    ProfilePictureUrl: comment.createdBy.UserProfilePictureUrl,
                  },
                  creationDate: moment(comment.CreationDate).format(
                    "DD MMM YYYY"
                  ),
                  timeAgo: this._utils.getTimeAgo(comment.CreationDate),
                  allowedActions: comment.allowedActions,
                };
              }
            );
            this.activity.sharedStats = resp.ResponseResult.SharedStats;
            this.activity.isShared = resp.ResponseResult.IsShared;
            this.activity.maxClaims = resp.ResponseResult.MaxClaims;
            this.activity.totalClaims = resp.ResponseResult.TotalClaims;
            this.activity.sharedWithUsers = !!resp.ResponseResult.IsShared && resp.ResponseResult.SharedWithUsers.length > 0 ? resp.ResponseResult.SharedWithUsers.map((user:any) => {
              return {
                UserId: user.Id,
                UserName: user.Name,
                Position: user.Position,
                selected: true,
                hasClaimed: user.HasClaimed,
                profilePictureUrl: user.ProfilePictureUrl
              }
            }) : [];
            this.activity.sharedWithUsersClaimed = this.activity.sharedWithUsers.filter((user:any) => user.hasClaimed);
            this.activity.sharedWithUsersNotClaimed = this.activity.sharedWithUsers.filter((user:any) => !user.hasClaimed);
            this.activity.isClaimedByloggedIn = resp.ResponseResult.IsShared ? this.getClaimStatus() : false;
            this.activity.isSharedByloggedIn = resp.ResponseResult.IsShared == true && resp.ResponseResult.AssignedBy_UserId == this.loggedInUserId ? true : false;
            this.activity.requestId = resp.ResponseResult.ESP_RequestId;
            this.activity.requestNumber = resp.ResponseResult.ESP_RequestNumber;
            this.activity.requestName = resp.ResponseResult.ESP_RequestName;
            this.activity.isReassigned = resp.ResponseResult.IsReassigned;
            this.activityArr = [];
            this.activityArr[0] = this.activity;
            this.activityDataSource = new MatTableDataSource(this.activityArr);
            this.displayedColumns = [];
            if (!!this.activity.createdBy && this.activity.createdBy.UserId != this.loggedInUserId && !this.activity.isShared || this.activity.isShared) {
              this.displayedColumns.push("assignedBy");
            }
            if (!this.isEpmActivity && this.activity.parentBoardId != null || this.isEpmActivity && !!this.activity.epmInfo && this.activity.epmInfo.ParentProjectId != null) {
              this.displayedColumns.push("project");
            }

            if (this.activity.dueDate != null) {
              this.displayedColumns.push("dueDate");
            }

            if (this.activity.appType == 4 && this.activity.requestNumber != null) {
              this.displayedColumns.push("requestNumber");
              this.displayedColumns.push("requestName");
            }
            if (
              this.activity.effortSum != null &&
              this.activity.effortSum != 0 && this.activity.appType != 3
              || this.activity.appType == 3

            ) {
              this.displayedColumns.push("efforts");
            }

            if (this.activity.isShared && this.isAccessedFromShared) {
              this.displayedColumns.push("claimed");
              this.displayedColumns.push("started");
              this.displayedColumns.push("completed");
            }

            this.activity.allowedActions =
              this._allowedActions.getAllowedActions(
                resp.ResponseResult.Owner_UserId,
                resp.ResponseResult.AssignedBy_UserId,
                this.isEngProActivity
                  ? parseInt(this.engProLoggedInUserId)
                  : parseInt(this.loggedInUserId),
                this._utils.getActivityStatus(
                  resp.ResponseResult.Status,
                  resp.ResponseResult.ActualValue,
                  resp.ResponseResult.IsShared
                ),
                resp.ResponseResult.AllowedActions,
                resp.ResponseResult.IsAccepted,
                resp.ResponseResult.IsReassigned,
                this.isEngProActivity,
                resp.ResponseResult.DueDate,
                resp.ResponseResult.MaxClaims,
                resp.ResponseResult.TotalClaims,
                preURL
              );


            this.canLogActual = true;
            this.canEdit = true;
            this.canRead = true;
            this.canAppened = true;
            this.isError = false;
            this.dataLoaded = true;
            this.isLoading = false;
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      }),
      (error: Error): void => {
        this.isError = true;
        this.dataLoaded = false;
        this.isLoading = false;
      };
  }

  getOppProDetails(activityId: string) {
    this.isLoading = true;
    this._activitiesService
      .getOppProActivityDetails(activityId, this.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001") {
            this.activityId = resp.result.activityId.toString();
            this.oppProActivity = {
              activityId: resp.result.activityId,
              id: resp.result.activityId,
              appType: 2,
              activityType: resp.result.activityType,
              oppProActivityType: resp.result.activityType,
              actualClosingDate: resp.result.actualClosingDate,
              actualDurationMinutes: resp.result.actualDurationMinutes,
              actualDurationMinutesFormatted:
                resp.result.actualDurationMinutesFormatted,
              isShared: false,
              effortSum: parseInt(resp.result.durationMinutes),
              effortInHour: Math.floor(
                moment
                  .duration(parseInt(resp.result.durationMinutes), "minutes")
                  .asHours()
              ),
              effortInMinute: Math.floor(
                moment
                  .duration(
                    moment
                      .duration(
                        parseInt(resp.result.durationMinutes),
                        "minutes"
                      )
                      .asHours() -
                    Math.floor(
                      moment
                        .duration(
                          parseInt(resp.result.durationMinutes),
                          "minutes"
                        )
                        .asHours()
                    ),
                    "hours"
                  )
                  .asMinutes()
              ),
              amISubscriber: resp.result.amISubscriber,
              associatedEntityId: resp.result.associatedEntityId,
              associatedEntityName: resp.result.associatedEntityName,
              associatedEntityTitle: resp.result.associatedEntityTitle,
              attachments: resp.result.attachments,
              callDirection: resp.result.callDirection,
              channel: resp.result.callDirection == 1 ? "Onsite" : "Online",
              callFromId: resp.result.callFromId,
              callFromName: resp.result.callFromName,
              callToActionId: resp.result.callToActionId,
              callToActionTitle: resp.result.callToActionTitle,
              callToId: resp.result.callToId,
              callToName:
                resp.result.activityType == "meeting"
                  ? this.getNames(JSON.parse(resp.result.callToName.toString()))
                  : resp.result.callToName,
              callToNameObj:
                resp.result.activityType == "meeting"
                  ? JSON.parse(resp.result.callToName.toString())
                  : resp.result.callToName,
              completedOnDate: resp.result.completedOnDate,
              createdById: resp.result.createdById,
              createdByName: resp.result.createdByName,
              createdDate: resp.result.createdDate,
              description: resp.result.description,
              note: resp.result.description,
              durationMinutes: resp.result.durationMinutes,
              durationMinutesFormatted: resp.result.durationMinutesFormatted,
              hasAttachment: resp.result.hasAttachment,
              isCancelled: resp.result.isCancelled,
              isCompleted: resp.result.isCompleted,

              progressStatus: resp.result.isCancelled
                ? "Cancelled"
                : resp.result.isCompleted
                  ? "Done"
                  : "Planned",
              progressStatusColor: resp.result.isCancelled
                ? "#EB487F"
                : resp.result.isCompleted
                  ? "#33BA70"
                  : "#00a3ff",
              meetingIsAllDayEvent: resp.result.meetingIsAllDayEvent,
              organizationId: resp.result.organizationId,
              organizationName: resp.result.organizationName,
              ownerName: resp.result.ownerName,
              priorityCode: resp.result.priorityCode,
              reminderAddedDate: resp.result.reminderAddedDate,
              reminderSelectedDate: resp.result.reminderSelectedDate,
              reminderSelectedOption: resp.result.reminderSelectedOption,
              scheduleEnd: resp.result.scheduleEnd,
              date:
                resp.result.scheduleEnd != null
                  ? moment(new Date(resp.result.scheduleEnd)).format(
                    "DD MMM YYYY"
                  )
                  : null,

              startTime:
                resp.result.scheduleEnd != null
                  ? moment(
                    new Date(
                      new Date(resp.result.scheduleEnd).getTime() -
                      Math.abs(
                        parseInt(resp.result.durationMinutes) * 60000
                      )
                    )
                  )
                    .local()
                    .format("hh:mm A")
                  : null,
              endTime:
                resp.result.scheduleEnd != null
                  ? moment(
                    new Date(new Date(resp.result.scheduleEnd).getTime())
                  )
                    .local()
                    .format("hh:mm A")
                  : null,

              scheduleStart: resp.result.scheduleStart,
              subject: resp.result.subject,
              updatedById: resp.result.updatedById,
              updatedByName: resp.result.updatedByName,
              canEdit: true,
            };
            this.activityArr = [];
            this.activityArr[0] = this.oppProActivity;
            this.activityDataSource = new MatTableDataSource(this.activityArr);
            this.canLogActual = true;
            this.canEdit = true;
            this.canRead = true;
            this.canAppened = true;
            this.isError = false;
            this.dataLoaded = true;
            this.isLoading = false;
          } else {
            this._alertService.error(resp.message, {
              timeout: 3000,
            });
          }
        }
      });
  }

  getNames(callTo:any) {
    let names = [];

    for (var i = 0; i < callTo.customerAttendeesList.length; i++) {
      names.push(callTo.customerAttendeesList[i].name);
    }

    for (var i = 0; i < callTo.partnerAttendeesList.length; i++) {
      names.push(callTo.partnerAttendeesList[i].name);
    }
    return names.join(", ");
  }

  getEndTime(dt:any, minutes:any) {
    return new Date(dt.getTime() + minutes * 60000);
  }


  getClaimStatus() {
    let loggedInuserInShareList = this.activity?.sharedWithUsersClaimed?.find((user:any) => user.UserId == this.loggedInUserId);
    return !!loggedInuserInShareList && loggedInuserInShareList.HasClaimed;
  }

  enableEditNote() {
    this.noteInEditMode = true; this.note = this.activity?.note;
  }
  addNote($event: KeyboardEvent) {
    if ($event.key === "Enter") {
      this.sendNote();
    }
  }

  sendNote() {
    this.noteInEditMode = false;
    this.isLoadingNote = true;
    if (!this.isOppProActivity) {
      this._activitiesService
        .updateNotes(
          this.activityId,
          this.note,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp:any) => {
          if (!!resp) {
            if (resp?.ResponseCode == 2000) {
              this.activity!.note = this.note;
              this.isLoadingNote = false;
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
              this.note = '';
              this.isLoadingNote = false;
            }
          }
        }),
        (error: Error): void => { };
    } else {
      switch (this.oppProActivity.activityType) {
        case "meeting":
          this.submitMeeting();
          break;
        case "proposal":
          this.submitProposal();
          break;
        default:
          this.submitCall();
          break;
      }
    }
  }

  submitProposal() {
    let data = {
      activityId: this.oppProActivity.activityId,
      activityType: this.oppProActivity.activityType,
      hasAttachment: this.oppProActivity.hasAttachment,
      subject: this.oppProActivity.subject,
      description: this.note,
      callToActionId: this.oppProActivity.callToActionId,
      callToActionTitle: this.oppProActivity.callToActionTitle,
      callToId: this.oppProActivity.callToId,
      callToName: this.oppProActivity.callToName,
      callFromId: this.oppProActivity.callFromId,
      callFromName: this.oppProActivity.callFromName,
      createdDate: moment(
        new Date(this.oppProActivity.createdDate),
        "DD MM YYYY hh:mm:ss A"
      ),
      ownerId: this.oppProActivity.ownerId,
      ownerName: this.oppProActivity.ownerName,
      scheduleEnd: this.oppProActivity.scheduleEnd, //.add(1, "day"),

      durationMinutes: this.oppProActivity.durationMinutes,
      associatedEntityId: this.oppProActivity.associatedEntityId,
      associatedEntityName: this.oppProActivity.associatedEntityName,
      isReminderUpdated: this.oppProActivity.isReminderUpdated,
      reminderSelectedOption: this.oppProActivity.reminderSelectedOption,
      reminderSelectedDate: this.oppProActivity.reminderSelectedDate,
      reminderAddedDate: this.oppProActivity.reminderAddedDate,

      createdById: this.oppProData.user.applicationUserId,
      createdByName:
        this.oppProData.user.firstName + " " + this.oppProData.user.lastName,
      EmailCreatedBy: this.oppProData.user.email,
      // EmailPreparedBy: this.selectedCallFromUserEmail,
      // EmailTo: this.selectedCallToUserEmails,
      action: "SaveAsDraft",
      UpdatedById: this.oppProData.user.applicationUserId,
      UpdatedByName:
        this.oppProData.user.firstName + " " + this.oppProData.user.lastName,
    };
    this._activitiesService
      .editOppProProposal(data, this.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code == "001") {
            this.oppProActivity.note = this.note;
            this.oppProActivity.description = this.note;
            this.isLoadingNote = false;
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.note = '';
            this.isLoadingNote = false;
          }
        }
      });
  }

  submitMeeting() {
    let data = {
      attendeesInformation: {
        customerAttendeesList: this.oppProActivity.callToNameObj
          .customerAttendeesList,
        customerId: this.oppProActivity.associatedEntityId,
        customerName: this.oppProActivity.associatedEntityName,
        emailCreatedBy: this.oppProData.user.email,
        emailListOfCustomerAttendees: this.oppProActivity.callToNameObj
          .emailListOfCustomerAttendees,
        action: "SaveAsDraft",
        partnerAttendeesList: this.oppProActivity.callToNameObj
          .partnerAttendeesList,
        emailListOfPartners: this.oppProActivity.callToNameObj
          .emailListOfPartners,
        emailSignature: this.oppProActivity.callToNameObj.emailSignature,
      },
      activityId: this.oppProActivity.activityId,
      activityType: this.oppProActivity.activityType,
      hasAttachment: this.oppProActivity.hasAttachment,
      subject: this.oppProActivity.subject,
      description: this.note,
      callToActionId: this.oppProActivity.callToActionId,
      callToActionTitle: this.oppProActivity.callToActionTitle,
      callToId: this.oppProActivity.callToId,
      callToName: this.oppProActivity.callToName,
      callFromId: this.oppProActivity.callFromId,
      callFromName: this.oppProActivity.callFromName,
      createdDate: moment(
        new Date(this.oppProActivity.createdDate),
        "DD MM YYYY hh:mm:ss A"
      ),
      ownerId: this.oppProActivity.ownerId,
      ownerName: this.oppProActivity.ownerName,
      scheduleEnd: this.oppProActivity.scheduleEnd, //.add(1, "day"),

      durationMinutes: this.oppProActivity.durationMinutes,
      associatedEntityId: this.oppProActivity.associatedEntityId,
      associatedEntityName: this.oppProActivity.associatedEntityName,
      isReminderUpdated: this.oppProActivity.isReminderUpdated,
      reminderSelectedOption: this.oppProActivity.reminderSelectedOption,
      reminderSelectedDate: this.oppProActivity.reminderSelectedDate,
      reminderAddedDate: this.oppProActivity.reminderAddedDate,

      createdById: this.oppProData.user.applicationUserId,
      createdByName:
        this.oppProData.user.firstName + " " + this.oppProData.user.lastName,
      meetingIsAllDayEvent: true,
    };
    this._activitiesService
      .editOppProMeeting(data, this.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code == "001") {
            this.oppProActivity.note = this.note;
            this.oppProActivity.description = this.note;
            this.isLoadingNote = false;
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.note = '';
            this.isLoadingNote = false;
          }
        }
      });
  }

  submitCall() {
    let data = {
      activityId: this.oppProActivity.activityId,
      activityType: this.oppProActivity.activityType,
      hasAttachment: this.oppProActivity.hasAttachment,
      subject: this.oppProActivity.subject,
      description: this.note,
      callToActionId: this.oppProActivity.callToActionId,
      callToActionTitle: this.oppProActivity.callToActionTitle,
      callToId: this.oppProActivity.callToId,
      callToName: this.oppProActivity.callToName,
      callFromId: this.oppProActivity.callFromId,
      callFromName: this.oppProActivity.callFromName,
      createdDate: moment(
        new Date(this.oppProActivity.createdDate),
        "DD MM YYYY hh:mm:ss A"
      ),
      ownerId: this.oppProActivity.ownerId,
      ownerName: this.oppProActivity.ownerName,
      scheduleEnd: this.oppProActivity.scheduleEnd, //.add(1, "day"),

      durationMinutes: this.oppProActivity.durationMinutes,
      associatedEntityId: this.oppProActivity.associatedEntityId,
      associatedEntityName: this.oppProActivity.associatedEntityName,
      isReminderUpdated: this.oppProActivity.isReminderUpdated,
      reminderSelectedOption: this.oppProActivity.reminderSelectedOption,
      reminderSelectedDate: this.oppProActivity.reminderSelectedDate,
      reminderAddedDate: this.oppProActivity.reminderAddedDate,

      createdById: this.oppProData.user.applicationUserId,
      createdByName:
        this.oppProData.user.firstName + " " + this.oppProData.user.lastName,
      priorityCode: this.oppProActivity.priorityCode,
    };
    this._activitiesService
      .editOppProCall(data, this.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code == "001") {
            this.oppProActivity.note = this.note;
            this.oppProActivity.description = this.note;
            this.isLoadingNote = false;
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.note = '';
            this.isLoadingNote = false;
          }
        }
      });
  }

  addComment($event: KeyboardEvent) {
    if ($event.key === "Enter") {
      this.sendComment();
    }
  }

  sendComment() {
    this.isLoadingComment = true;
    this._commentsService
      .addComment(
        this.comment,
        this.activityId,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp?.ResponseCode == 2000) {
              this.comment = null;
              this._alertService.success(resp?.ResponseMessage, {
                timeout: 3000,
              });
              this.showComments();
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
              this.comment = null;
              this.isLoadingComment = false;
            }
          }
        },
        (error: Error): void => { }
      );
  }
  openFileUploader() {
    document.getElementById("wizard-upload-file")?.click();
  }

  showAttachments() {
    this._attachmentsService
      .getAttachments(this.activityId, EntityTypes.Indicator)
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.activity!.attachments = resp.ResponseResult.attachments.map(
                (attachment:any) => {
                  return {
                    id: attachment.Id,
                    name: attachment.Name.substr(
                      0,
                      attachment.Name.lastIndexOf(".")
                    ),
                    size: attachment.SizeInKB,
                    fileUrl: attachment.FileUrl,
                    type:
                      attachment.fileType === 0
                        ? "jpg"
                        : attachment.fileType === 1
                          ? "jpeg"
                          : attachment.fileType === 2
                            ? "png"
                            : attachment.fileType === 3
                              ? "gif"
                              : attachment.fileType === 4
                                ? "doc"
                                : attachment.fileType === 5
                                  ? "docx"
                                  : attachment.fileType === 6
                                    ? "xls"
                                    : attachment.fileType === 7
                                      ? "xlsx"
                                      : attachment.fileType === 8
                                        ? "pdf"
                                        : attachment.fileType === 13
                                          ? "ppt"
                                          : attachment.fileType === 14
                                            ? "pptx"
                                            : //  attachment.fileType === 9 ? 'mp3' :
                                            // attachment.fileType === 10 ? 'wav' :
                                            // attachment.fileType === 11 ? 'mp4' :
                                            // attachment.fileType === 12? 'xwav' :

                                            "unknown",
                  };
                }
              );

              this.isLoadingAttachment = false;
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });

              this.isLoadingAttachment = false;
            }
          }
        },
        (error: Error): void => { }
      );
  }
  showComments() {
    this._activitiesService
      .getActivityDetails(
        this.activityId,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.activity!.comments = resp.ResponseResult.Comments.map(
                (comment:any) => {
                  return {
                    id: comment.Id,
                    text: comment.Text,
                    activityId: comment.Indicator_IndicatorId,
                    createdBy_UserId: comment.CreatedBy_UserId,
                    createdBy: {
                      FirstName: comment.createdBy.FirstName,
                      LastName: comment.createdBy.LastName,
                      ProfilePictureUrl:
                        comment.createdBy.UserProfilePictureUrl,
                    },
                    creationDate: moment(comment.CreationDate).format(
                      "DD MMM YYYY"
                    ),
                    timeAgo: this._utils.getTimeAgo(comment.CreationDate),
                    allowedActions: comment.allowedActions,
                  };
                }
              );

              this.isLoadingComment = false;
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
              this.isLoadingComment = false;
            }
          }
        },
        (error: Error): void => { }
      );
  }

  uploadFile(event:any) {
    if (event.target.files && event.target.files.length > 0) {
      this.isLoadingAttachment = true;
      let file = event.target.files[0];

      let fileName = file.name.substr(0, file.name.lastIndexOf("."));

      let data: FormData = new FormData();
      data.append("EntityId", this.activityId);
      data.append("EntityType", "7");
      data.append("FileName", fileName);
      data.append("File", file);

      file.upload = this._attachmentsService
        .uploadAttchament(
          data,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp:any) => {
          if (!!resp) {
            if (resp?.ResponseCode == 2000) {
              this._alertService.success(resp?.ResponseMessage, {
                timeout: 3000,
              });
              this.showAttachments();
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });

              this.isLoadingAttachment = false;
            }
          }
        });
    }
  }

  deleteAttachment(attachmentId: any) {
    this.isLoadingAttachment = true;
    this._attachmentsService
      .deleteAttchament(
        attachmentId,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp?.ResponseCode == 2000) {
            this._alertService.success(resp?.ResponseMessage, {
              timeout: 3000,
            });
            this.showAttachments();
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });

            this.isLoadingAttachment = false;
          }
        }
      });
  }
  deleteComment(commentId: any) {
    this.isLoadingComment = true;
    this._commentsService
      .deleteComment(
        commentId,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp?.ResponseCode == 2000) {
            this._alertService.success(resp?.ResponseMessage, {
              timeout: 3000,
            });
            this.showComments();
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.isLoadingComment = false;
          }
        }
      });
  }
  doFollow() {
    if (!this.activity!.isFollowed) {
      this._activitiesService
        .follow(
          this.activityId,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp:any) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.activity!.isFollowed = !this.activity!.isFollowed;
              this._alertService.success(resp?.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(resp?.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      this._activitiesService
        .unfollow(
          this.activityId,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp:any) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.activity!.isFollowed = !this.activity!.isFollowed;
              this._alertService.success(resp?.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }
  urlify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
  }
  toggleImportant() {
    this._activitiesService
      .toggleImportant(this.activityId, this.engProLoggedInUserId, this.activity!.appType == 1)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.activity!.isImportant = !this.activity!.isImportant;
            this._alertService.success(resp?.ResponseMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }

  openLogDialog(): void {
    const dialogRef = this._dialog.open(LogDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activity: this.activity,
        isForNew: false,
        engProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.isEngProActivity,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.isLoadingEffort = true;

        let effort = result.data;//.form;
        this.activity!.actualValue = effort.actualValue;
        this.activity!.score = effort.actualValue;
        this.activity!.progressStatus =
          effort.actualValue == null ? "Not Started" : "In progress";
        this.activity!.progressStatusColor =
          effort.actualValue == null ? "#8795b1" : "#00a3ff";
        let newLog:any = {
          showLongComment: false,
          creationDate: null,
          endTime:
            effort.endTime != null && effort.endTime != ""
              ? moment.utc(effort.endTime).local().format("h:mm a")
              : // .replace(/\s/g, "")
              null,
          hours: effort.effortInHour,
          id: 0,
          minutes: effort.effortInMinute,
          note: effort.comment,
          startTime:
            effort.startTime != null && effort.startTime != ""
              ? moment
                .utc(effort.startTime)
                .local()
                .format("h:mm a")
                .replace(/\s/g, "")
              : null,
          startTimeDate:
            effort.startTime != null && effort.startTime != ""
              ? moment.utc(effort.startTime).local().format("LLL")
              : null,
          endTimeDate:
            effort.endTime != null && effort.endTime != ""
              ? moment.utc(effort.endTime).local().format("LLL")
              : null,
          completedDate:
            effort.logDate != null && effort.logDate != ""
              ? moment(effort.logDate).format("DD MMM YYYY")
              : null,
        };

        if (
          newLog.startTime == null &&
          newLog.endTime == null &&
          newLog.minutes == null &&
          newLog.hours == null
        ) {
          this.activity!.effortInHour = Math.floor(
            moment.duration(this.activity!.effortSum, "minutes").asHours()
          );

          this.activity!.effortInMinute = Math.floor(
            moment
              .duration(
                moment.duration(this.activity!.effortSum, "minutes").asHours() -
                Math.floor(
                  moment
                    .duration(this.activity!.effortSum, "minutes")
                    .asHours()
                ),
                "hours"
              )
              .asMinutes()
          );
          this.isLoadingEffort = false;
          return;
        } else {
          if (this.activity!.effortSum == null || this.activity!.effortSum == 0) {
            this.displayedColumns.push("efforts");
          }
        }

        if (newLog.startTime != null && newLog.endTime != null) {
          let duration = moment.duration(
            moment(newLog.endTime, "hh:mm").diff(
              moment(newLog.startTime, "hh:mm")
            )
          );
          let minutes = Math.abs(duration.asMinutes());
          this.activity!.effortSum! += minutes;

          newLog.minutes = Math.floor(
            moment
              .duration(
                moment.duration(minutes, "minutes").asHours() -
                Math.floor(moment.duration(minutes, "minutes").asHours()),
                "hours"
              )
              .asMinutes()
          );

          newLog.hours = Math.floor(
            moment.duration(minutes, "minutes").asHours()
          );
        } else {
          if (newLog.minutes != null) {
            this.activity!.effortSum += newLog.minutes;
          }

          if (newLog.hours != null) {
            this.activity!.effortSum! += moment
              .duration(newLog.hours, "hours")
              .asMinutes();
          }
        }

        this.activity!.effortInHour = Math.floor(
          moment.duration(this.activity!.effortSum, "minutes").asHours()
        );

        this.activity!.effortInMinute = Math.floor(
          moment
            .duration(
              moment.duration(this.activity!.effortSum, "minutes").asHours() -
              Math.floor(
                moment.duration(this.activity!.effortSum, "minutes").asHours()
              ),
              "hours"
            )
            .asMinutes()
        );

        this.activity?.efforts.push(newLog);
        this.activity?.efforts.reverse();

        this.isLoadingEffort = false;
      }
    });
  }

  isMaxCharsReached(comment?:any, index?:any) {
    // let lines =
    //   this.activity.note != null ? this.activity.note.split("\n") : null;
    // return lines != null ? lines.length > 10 : false;

    if (comment != undefined) {
      this.effortIndex = index;
      let chars = comment != null ? comment.length : null;
      return chars != null ? chars > 275 : false;
    } else {
      let chars = null;
      if (!this.isOppProActivity) {
        chars = this.activity?.note != null ? this.activity?.note.length : null;
      } else {
        chars =
          this.oppProActivity.note != null
            ? this.oppProActivity.note.length
            : null;
      }

      return chars != null ? chars > 415 : false;
    }
  }

  openShareWithUsersDialog() {
    const dialogRef = this._dialog.open(ShareWithUsersDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // height: this.size == "XS" || this.size == "SM" ? "100%" : "620px",
      panelClass:
        this.size == "XS" || this.size == "SM"
          ? "small-dialog"
          : "large-dialog",
      maxWidth:
        this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight:
        this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activityId: this.activity!.id,
        activityAppType: this.activity!.appType,
        engagementProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.isEngProActivity
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getDetails(this.activityId);
    });


  }

  isLast(last: any, bool?: boolean) {
    if (bool) {
      return this.activity?.tactic?.tags?.length ? this.activity?.tactic?.tags?.length - 1 : '';
    }

    return last && this.activity?.tactic?.tags?.length && this.activity?.tactic?.tags?.length > 1;
  }

  ngOnDestroy(): void {
    //this.activity = null;
    localStorage.removeItem("preURL");
  }
}
