import { Component, OnInit, Inject, ElementRef, ViewChild } from "@angular/core";

import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { delay, debounceTime, distinctUntilChanged } from "rxjs/operators";
import * as moment from "moment";
import { LogDialog } from "../log-dialog/log-dialog";
import { forkJoin, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ResizeService } from "../../../../esp-activity-module/services/resize.service";
import { ApplicationService } from "../../../../esp-activity-module/services/application.service";
import { ActivitiesService } from "../../../../esp-activity-module/services/activities.service";
import { AlertService } from "../../../../esp-activity-module/alert/alert.service";
import { UtilsService } from "../../../../esp-activity-module/services/utils.service";
import { SimplestrataAuthService } from "../../../../esp-activity-module/services/simplestrata-auth.service";
import { AllowedActionsService } from "../../../../esp-activity-module/services/allowed-actions.service";
import { AuthService, AuthType } from "../../../../esp-activity-module/services/auth.service";
import { Addon } from "../../../../esp-activity-module/models/addon.model";
import { SCREEN_SIZE } from "../../../../esp-activity-module/services/shared.enums";
import { Activity } from "../../../../esp-activity-module/models/activity";
import { Tactic } from "../../../../esp-activity-module/models/tactic";
import { Category } from "../../../../esp-activity-module/models/category";
import { Actions, Conditions, Definitions } from "./../../../../esp-activity-module/enums/enums";


@Component({
  selector: "xcdrs-activity-dialog",
  templateUrl: "./activity-dialog.html",
  styleUrls: ["./activity-dialog.scss"],
})
export class ActivityDialog implements OnInit {
  size!: string;
  form!: FormGroup;
  isLoading: boolean = false;
  isLoadingAttachment: boolean = false;
  dataLoaded: boolean = false;
  expandForm: boolean = false;
  loggedInUserId: any;
  engagementProLoggedInUserId: any = null;
  projects: Array<any> = [];
  jobs: Array<any> = [];
  users: Array<any> = [];
  allUsers: Array<any> = [];
  units: Array<any> = [];
  selectedProject: any = null;
  selectedJob: any = null;
  attachements: Array<any> = [];
  selectedCondition: any = null;
  conditions: Array<{ id: number; name: string }> = [
    { id: 2, name: "More Than" },
    { id: 1, name: "Less Than" },
    { id: 3, name: "Equal" },
  ];
  selectedApp: number = 0;
  applications: Array<{ id: number; name: string }> = [
    { id: 0, name: "SimpleStrata" },
  ];
  isMine: any;
  isBacklog: boolean = false;
  follow: boolean = true;
  effortLogged: boolean = false;
  important: boolean = false;
  assignedTo: any;
  effort: any;
  files: Array<File> = [];
  activity: any;
  formMode!: string;
  engagementProData: any;
  tacticLabelText!: string;
  isEngProActivity: boolean = false;
  tacticsLabelText!: string;
  isPlan: boolean = false;
  isReassigned: boolean = false;
  recurringType: string = "None";
  recurringSubmitData:any =null;
  activityTypes: { id: number; name: string; active: boolean }[] = [
    {
      id: 0,
      name: "Assigned",
      active: true,
    },
    {
      id: 1,
      name: "Shared",
      active: false,
    },
  ];
  types: { id: number; name: string; active: boolean }[] = [
    {
      id: 0,
      name: "Opportunity",
      active: true,
    },
    {
      id: 1,
      name: "Customer",
      active: false,
    },
    {
      id: 2,
      name: "Sales Job",
      active: false,
    },
  ];
  oppotunities: { id: number; name: string }[] = [];
  selectedOpportunity: any = null;
  customers: { id: number; name: string }[] = [];
  selectedCustomer: any = null;
  callToActions: { id: number; name: string }[] = [];
  selectedCallToAction: any = null;
  callToUsers: {
    id: number;
    name: string;
    emails?: string[];
    type?: string;
    selected?: boolean;
  }[] = [];
  selectedCallToUser: any = null;
  selectedCallToUserEmails: string[] = [];
  callFromUsers: { id: number; name: string }[] = [];
  selectedCallFromUser: any = null;
  selectedCallFromUserEmail: any = null;
  salesJobs: { id: number; name: string }[] = [];
  isOpportunity: boolean = true;
  isSalesJob: boolean = false;
  territoryFilter: number[] = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 18];
  hr!: number;
  min!: number;
  sec!: number;
  isShared:boolean=false;
  isAssigned:boolean=false;
  selectedRequestNumber:any=null;
  selectedRequestName:any=null;

  shareWithUsersList!: any[];
  isShareWithAllSelected: boolean = false;
  shareWithAllOpt = {
    UserId: -2,
    UserName: "All",
    Position: null,
    selected:false,
  };
  activityId:any;
  requestId:any;
  isError:boolean=false;
 // filteredShareWithList: any[];
  shareWithList:{ UserId: number; UserName: string ; Position:string; selected:boolean}[] =[];
  shareWithSearch: any = null;
  selectionToggled:boolean=false;
  isESPcomponent:boolean=false;

  projectSearchKeyWord:string='';
  jobSearchKeyWord:string='';
  isProjectSearch:boolean = false;
  isJobSearch:boolean = false;
  tempProjects: Array<any> = [];
  tempJobs: Array<any> = [];
  isFromAllActivities:boolean = false;

  epmConnectionData:any=!!localStorage.getItem("epmConnectuionData")? JSON.parse(localStorage.getItem("epmConnectuionData")!) : null;
  isEpmEnabled:boolean=!!localStorage.getItem("epmConnectuionData")?true:false;
  @ViewChild("shareWithInput") shareWithInput!: ElementRef;
  @ViewChild("auto") matAutocomplete!: MatAutocomplete;

  @ViewChild('autoCompleteInputLinkTo', { read: MatAutocompleteTrigger })
  autoCompleteLinkTo!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputBoard', { read: MatAutocompleteTrigger })
  autoCompleteBoard!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputJob', { read: MatAutocompleteTrigger })
  autoCompleteJob!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputOpportunity', { read: MatAutocompleteTrigger })
  autoCompleteOpportunity!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputCustomer', { read: MatAutocompleteTrigger })
  autoCompleteCustomer!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputPurpose', { read: MatAutocompleteTrigger })
  autoCompletePurpose!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputCallFrom', { read: MatAutocompleteTrigger })
  autoCompleteCallFrom!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputUnit', { read: MatAutocompleteTrigger })
  autoCompleteUnit!: MatAutocompleteTrigger;

  @ViewChild('autoCompleteInputCondition', { read: MatAutocompleteTrigger })
  autoCompleteCondition!: MatAutocompleteTrigger;
  applicationId:any;
  applicationRequestNo:any;
  applicationRequestName:any;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _applicationService: ApplicationService,
    private _alertService: AlertService,
    private applicationService: ApplicationService,
    private _utils: UtilsService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _allowedActions: AllowedActionsService,
    private _authService: AuthService,
    private _http: HttpClient,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<ActivityDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isMine: any;
      formMode: string;
      activityId?: any;
      activityType?: any;
      engProData: any;
      oppProData?: any;
      action?: number;
      espAddon?:Addon;
      isEspEnabled?:boolean;
      isESPcomponent?:boolean;
      requestId?:boolean;
      isEpmActivity?:boolean;
      parentProjectId?:any;
      taskId?:any;
      isFromAllActivities?:boolean;
    }
  ) {
    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this._resizeService.onResize$.pipe(delay(0)).subscribe((x:any) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.applicationId=localStorage.getItem("EngPro_EntityId");
    this.isFromAllActivities = this.data.isFromAllActivities ? this.data.isFromAllActivities : this.isFromAllActivities;
    this.initDialog();
    window.addEventListener('scroll', this.scrollEvent, true);
    this.applicationService
    .getApplicationDetails(this.applicationId)
    .subscribe((response: any) => {
      this.applicationRequestNo=response.applicationNumber
      this.applicationRequestName=response.name
      console.log(response);
    });
  }

  scrollEvent = (event: any): void => {

    if(this.autoCompleteLinkTo && this.autoCompleteLinkTo.panelOpen)
      this.autoCompleteLinkTo.updatePosition();

    if(this.autoCompleteBoard && this.autoCompleteBoard.panelOpen)
      this.autoCompleteBoard.updatePosition();

    if(this.autoCompleteJob && this.autoCompleteJob.panelOpen)
      this.autoCompleteJob.updatePosition();

    if(this.autoCompleteOpportunity && this.autoCompleteOpportunity.panelOpen)
      this.autoCompleteOpportunity.updatePosition();

    if(this.autoCompleteCustomer && this.autoCompleteCustomer.panelOpen)
      this.autoCompleteCustomer.updatePosition();

    if(this.autoCompletePurpose && this.autoCompletePurpose.panelOpen)
      this.autoCompletePurpose.updatePosition();

    if(this.autoCompleteCallFrom && this.autoCompleteCallFrom.panelOpen)
      this.autoCompleteCallFrom.updatePosition();

    if(this.autoCompleteUnit && this.autoCompleteUnit.panelOpen)
      this.autoCompleteUnit.updatePosition();

    if(this.autoCompleteCondition && this.autoCompleteCondition.panelOpen)
      this.autoCompleteCondition.updatePosition();
  };

  initDialog() {
    this.formMode = this.data.formMode;
    this.setActiveApplications();
    if (this.formMode == "edit" || this.formMode == "reassign") {
      this.getDetailsForEditMode();
    }else{
      this.setFormFlags();
      this.initFormGroupData();
      this.onChanges();
    }
  }

  getDetailsForEditMode(){
    this.activityId = this.data.activityId;
    if (this.data.activityType !=2 ) {
      this.getDetails(this.activityId);
    } else {
      this.getOppProDetails(this.activityId);
    }
  }
  getDetails(activityId: string) {
    this._activitiesService
      .getActivityDetails(
        activityId,
        this.data.engProData.engProLoggedInUserId,
        this.data.activityType == 1,
        this.data.isEpmActivity,
        this.data.parentProjectId,
        this.data.taskId,
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp?.ResponseCode == 2000) {
            let preURL = localStorage.getItem('preURL');
            this.activity = new Activity();
            this.activity.activityType = "task";
            this.activity.id = resp?.ResponseResult.Id;
            this.activity.epmInfo =  resp?.ResponseResult.EpmInfo,
            this.activity.appType = this.data.activityType;// == 1 ? 1 : resp.ResponseResult.ESP_RequestId !=null ? 4 : 0;
            this.isEngProActivity = this.activity.appType == 1 ? true : false;
            this.activity.requestId =resp?.ResponseResult.ESP_RequestId;
            this.activity.tacticLabelText = resp?.ResponseResult.TacticLabelText;
            this.activity.tacticsLabelText =
              resp?.ResponseResult.TacticsLabelText;
            this.activity.description = resp?.ResponseResult.Description;
            this.activity.targetValue = resp?.ResponseResult.TargetValue;
            this.activity.actualValue = resp?.ResponseResult.ActualValue;
            this.activity.createdBy_UserId =
              resp.ResponseResult.CreatedBy_UserId;
            this.activity.score = resp.ResponseResult.Score;
            this.activity.progressStatus = resp.ResponseResult.IsRejected
              ? "Rejected"
              : resp.ResponseResult.Status == 4 &&
                !resp.ResponseResult.IsReassigned
              ? "Cancelled"
              : resp.ResponseResult.Status == 4 &&
                resp.ResponseResult.IsReassigned
              ? "Reassigned"
              : resp.ResponseResult.Status == 2
              ? "Done"
              : resp.ResponseResult.ActualValue == null
              ? "Not Started"
              : "In progress";
            this.activity.progressStatusColor = resp.ResponseResult.IsRejected
              ? "#EB487F"
              : resp.ResponseResult.Status == 4
              ? "#EB487F"
              : resp.ResponseResult.Status == 2
              ? "#33BA70"
              : resp.ResponseResult.ActualValue == null
              ? "#8795b1"
              : "#00a3ff";
            this.activity.dueDate =
              resp.ResponseResult.DueDate != null
                ? moment(resp.ResponseResult.DueDate).format("DD MMM YYYY")
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
              resp.ResponseResult.CreationDate != null
                ? moment(resp.ResponseResult.CreationDate).format("DD MMM YYYY")
                : null;
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
              resp.ResponseResult.CompletedDate != null
                ? moment(resp.ResponseResult.CompletedDate).format(
                    "DD MMM YYYY"
                  )
                : null;
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
            this.activity.respEfforts =  resp.ResponseResult.Efforts;
            this.activity.efforts = resp.ResponseResult.Efforts.map(
              (effort:any) => {
                return {
                  showLongComment: false,
                  creationDate:
                    effort.CreationDate != null
                      ? moment(effort.CreationDate).format("DD MMM YYYY")
                      : null,
                  endTime:
                    effort.EndTime != null
                      ? moment
                          .utc(effort.EndTime)
                          .local()
                          .format("hh:mm a")
                          .replace(/\s/g, "")
                      : null,
                  endTimeDate:
                    effort.EndTime != null
                      ? moment.utc(effort.EndTime).local().format("LLL")
                      : null,
                  hours: effort.Hours,
                  id: effort.Id,
                  minutes: effort.Minutes,
                  note: effort.Note,
                  startTime:
                    effort.StartTime != null
                      ? moment
                          .utc(effort.StartTime)
                          .local()
                          .format("hh:mm a")
                          .replace(/\s/g, "")
                      : null,
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

            this.activity.respAttachments = resp.ResponseResult.Attachments
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
            this.attachements = this.activity.attachments;
            this.activity.sharedStats= resp.ResponseResult.SharedStats;
            this.activity.isShared= resp.ResponseResult.IsShared;
            this.activity.maxClaims= resp.ResponseResult.MaxClaims;
            this.activity.totalClaims = resp.ResponseResult.TotalClaims;
            this.activity.sharedWithUsers = !! resp.ResponseResult.IsShared && resp.ResponseResult.SharedWithUsers.length>0? resp.ResponseResult.SharedWithUsers.map((user:any)=>{
              return {
                UserId:user.Id,
                UserName:user.Name,
                Position:user.Position,
                selected:true,
                hasClaimed: user.HasClaimed,
                profilePictureUrl: user.ProfilePictureUrl
              }
            }):[];
            this.activity.sharedWithUsersClaimed = this.activity.sharedWithUsers.filter((user:any)=>user.hasClaimed);
            this.activity.sharedWithUsersNotClaimed = this.activity.sharedWithUsers.filter((user:any)=>!user.hasClaimed);

            this.activity.isSharedByloggedIn = resp.ResponseResult.IsShared==true  &&  resp.ResponseResult.AssignedBy_UserId == this.loggedInUserId? true:false;
            this.activity.requestId= resp.ResponseResult.ESP_RequestId;
            this.activity.requestNumber= resp.ResponseResult.ESP_RequestNumber;
            this.activity.requestName= resp.ResponseResult.ESP_RequestName;
            this.activity.isReassigned = resp.ResponseResult.IsReassigned;
            this.activity.owner_UserId = resp.ResponseResult.Owner_UserId;

            this.activity.allowedActions =
            this._allowedActions.getAllowedActions(
            resp.ResponseResult.Owner_UserId,
            resp.ResponseResult.AssignedBy_UserId,
            this.isEngProActivity
              ? parseInt( this.data.engProData.engProLoggedInUserId)
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
          this.effort = {
            effortSum: this.activity.effortSum,
            effortInMinute: this.activity.effortInMinute,
            effortInHour: this.activity.effortInHour,
          };
           if (!this.isPlan) {
              this.activity.efforts.length > 0
                  ? (this.effortLogged = true)
                  : (this.effortLogged = false);
            }

            if (this.formMode == "reassign") {
              this.activity.efforts = null;
              this.effortLogged = false;
            }
            this.setFormFlags();
            this.initFormGroupData();
            this.onChanges();

          }
        }
      });
  }

  getOppProDetails(activityId: string) {
    this._activitiesService
      .getOppProActivityDetails(activityId, this.data.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001") {
            this.activity = {
              activityId: resp.result.activityId,
              id: resp.result.activityId,
              appType: 2,
              activityType: resp.result.activityType,
              oppProActivityType:resp.result.activityType,
              actualClosingDate: resp.result.actualClosingDate,
              actualDurationMinutes: resp.result.actualDurationMinutes,
              actualDurationMinutesFormatted:
                resp.result.actualDurationMinutesFormatted,

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
            this.effort = {
              effortSum: this.activity.effortSum,
              effortInMinute: this.activity.effortInMinute,
              effortInHour: this.activity.effortInHour,
            };
            this.isEngProActivity = false;
                this.activity.durationMinutes > 0
            ? (this.effortLogged = true)
            : (this.effortLogged = false);
            this.setFormFlags();
            this.initFormGroupData();
            this.onChanges();
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

  getShareWith(){
    let shareWithUsers =null;
    if (!!this.activity && (this.formMode == "edit" )) {
      if (!!this.activity.sharedWithUsers && this.activity.sharedWithUsers !=null && this.activity.sharedWithUsers.length>0) {
        shareWithUsers = this.shareWithList.join(',');
      } else {
        shareWithUsers = null;
      }
    }
    return shareWithUsers;
  }

  getTitle() {
    let title = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        title = this.activity.description;
      } else {
        title = this.activity.subject;
      }
    }
    return title;
  }

  getDescription() {
    let description = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      description = this.activity.description;
    }
    return description;
  }

  getDueDate() {
    let dueDate = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        this.activity.dueDate != null
          ? (dueDate = new Date(this.activity.dueDate))
          : (dueDate = null);
      } else {
        this.activity.scheduleEnd != null
          ? (dueDate = new Date(this.activity.scheduleEnd))
          : (dueDate = null);
      }
    }
    return dueDate;
  }

  getStartDate() {
    let startDate = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign") &&
      this.activity.appType == 1
    ) {
      this.activity.startDate != null
        ? (startDate = new Date(this.activity.startDate))
        : (startDate = null);
    }
    return startDate;
  }
  getNotes() {
    let notes = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        notes = this.activity.note;
      } else {
        notes = this.activity.description;
      }
    }
    return notes;
  }

  getApplication() {
    let app = this.isESPcomponent ? "Requests": "SimpleStrata";
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType == 4) {
        app = "Requests";
      } else if (this.activity.appType == 3) {
        app = "MS Project Online";
      } else if (this.activity.appType == 2) {
        app = "OpportunityPro";
      } else if (this.activity.appType == 1) {
        app = "EngagementPro";
      } else {
        app = "SimpleStrata";
      }
    }
    return app;
  }

  getUnit() {
    let unit = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.tacticId != null) {
        unit = this.activity.tactic.unit;
      } else {
        unit = this.activity.unit;
      }
    }
    return unit;
  }

  getCondition() {
    let condition = null;
    if (
      !!this.activity &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.tacticId != null) {
        condition = this.activity.tactic.condition;
      } else {
        condition = this.activity.condition;
      }
    }
    return condition;
  }

  getEffortInHours() {
    let effortHrs = null;
    if (
      !!this.activity &&
      this.effortLogged &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        effortHrs = this.activity.efforts[0].hours;
      } else {
        effortHrs = this.activity.effortInHour;
      }
    }

    return effortHrs;
  }

  getEffortInMins() {
    let effortMins = null;
    if (
      !!this.activity &&
      this.effortLogged &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        effortMins = this.activity.efforts[0].minutes;
      } else {
        effortMins = this.activity.effortInMinute;
      }
    }

    return effortMins;
  }

  getCallFrom() {
    let callFrom = null;
    if (
      !!this.activity &&
      this.effortLogged &&
      (this.formMode == "edit" || this.formMode == "reassign")
    ) {
      if (this.activity.appType != 2) {
        callFrom = null;
      } else {
        callFrom = this.activity.callFromName;
      }
    }
    return callFrom;
  }

  getJob(){
      let job = null;
      if (
        !!this.activity && (this.formMode == "edit" || this.formMode == "reassign")
      ) {
        if (this.activity.appType == 0) {
          job = this.activity.tacticId != null ? this.activity.tactic.title : null;
        }
      }
      return job;
  }

  getProject(){
    let project = null;
    if (this.formMode == "edit" && !!this.activity && this.activity.appType != 2) {
      if (this.activity.appType == 0) {
        project = this.activity.parentBoardName;
      }

      if(this.activity.appType == 3){
        project = this.activity.epmInfo.ParentProjectName;
      }

      if (this.activity.appType == 4){
        project = this.activity.requestName + ' ' + this.activity.requestNumber;
      }

    }
    return project;
}

getActual(){

  let actual = null;
  if (
    !!this.activity &&
    (this.formMode == "edit" || this.formMode == "reassign")
  ) {
    if (this.activity.appType != 2 ) {
      actual = this.activity.actualValue;
    }

    // if(this.activity.appType == 3){
    //   actual = this.activity.epmInfo.Actual;
    // }
  }
  return actual;
}

getTarget(){
  let target = null;
  if (
    !!this.activity &&
    (this.formMode == "edit" || this.formMode == "reassign")
  ) {
    if (this.activity.appType != 2  ) {
      target = this.activity.targetValue;
    }

    // if(this.activity.appType == 3){
    //   target = this.activity.epmInfo.Target;
    // }
  }
  return target;
}
  initFormGroupData() {
    this.form = this._fb.group({
      title: new FormControl(this.getTitle(), [Validators.required]),
      description: new FormControl(this.getDescription()),
      reassignReason: new FormControl(null),
      dueDate: new FormControl(this.getDueDate()),
      // startDate: new FormControl(this.getStartDate()),
      project: new FormControl(this.getProject()),
      notes: new FormControl(this.getNotes()),
      job: new FormControl(
     this.getJob()
      ),
      targetValue: new FormControl(this.getTarget()),
      actualValue: new FormControl(this.getActual()),
      targetUnit: new FormControl(this.getUnit(), Validators.maxLength(15)),
      actualUnit: new FormControl(this.getUnit()),
      condition: new FormControl(this.getCondition()),
      assignedTo: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType != 2 && this.activity.appType != 3 && !!this.activity.userOwner && this.activity.userOwner!=null
          ? this.activity.userOwner.UserFirstName +
            " " +
            this.activity.userOwner.UserLastName
          : null,
        // !this.isMine && (!this.isBacklog || (this.isBacklog && this.isPlan)) && this.activity.appType != 2
        //   ? [Validators.required]
        //   : []
      ),
      logDate: new FormControl(
        this.formMode == "edit" &&
        !!this.activity &&
        this.activity.appType != 2 &&
        this.effortLogged
          ? this.activity.efforts[0].completedDate
          : null
      ),
      startTime: new FormControl(null),
      endTime: new FormControl(null),
      effortInHour: new FormControl(this.getEffortInHours()),
      effortInMinute: new FormControl(this.getEffortInMins()),
      comment: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType != 2
          ? this.activity.logComment
          : null
      ),
      weight: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType != 2
          ? this.activity.weight
          : null,
        !this.isBacklog || (this.isBacklog && this.isPlan)
          ? [Validators.min(0), Validators.max(100)]
          : []
      ),
      maxClaims: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.isShared
          ? this.activity.maxClaims
          : null
      ),
      shareWith: new FormControl(
        this.formMode == "edit" && !!this.activity
          ? this.activity.sharedWithUsers
          : []
      ),
      application: new FormControl(this.getApplication(), [
        Validators.required,
      ]),
      opportunity: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType == 2
          ? this.activity.associatedEntityTitle
          : null
      ),

      customer: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType == 2
          ? this.activity.associatedEntityTitle
          : null
      ),

      salesJob: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType == 2
          ? this.activity.associatedEntityTitle
          : null
      ),

      purpose: new FormControl(
        this.formMode == "edit" && !!this.activity && this.activity.appType == 2
          ? this.activity.callToActionTitle
          : null
      ),

      callFrom: new FormControl(this.getCallFrom()),

    });
    if (!!this.activity) {
      this.selectedApp = this.activity.appType;
      if (this.selectedApp != 2) {
        switch (this.formMode) {

          case "edit":
            this.selectedProject = this.activity.appType == 4 ? this.activity.requestId :this.activity.appType == 3 ? this.activity.epmInfo.ParentProjectId:this.activity.parentBoardId ;
            this.activity.appType == 4 || this.activity.appType == 3 ? this.onProjectSelected(this.selectedProject):"";
            this.selectedRequestName= this.activity.requestName;
            this.selectedRequestNumber= this.activity.requestNumber;
            this.selectedJob =  this.activity.appType == 4 || this.activity.appType == 3? null :this.activity.tacticId;
            this.assignedTo = this.activity.owner_UserId;
            this.follow = this.activity.isFollowed;
            this.important = this.activity.isImportant;
            this.selectedCondition =
              this.form.value.condition == "Equal"
                ? Conditions.Equal
                : this.form.value.condition == "Less Than"
                ? Conditions.LessThan
                : Conditions.MoreThan;
            break;

          case "reassign":
            this.selectedProject = null;
            this.selectedJob = null;
            this.assignedTo = null;
            break;
          default:
            break;
        }
      } else {
        this.selectedCallFromUser = this.activity.callFromId;
        this.selectedCallToUser = this.activity.callToId;
        this.selectedCallToAction = this.activity.callToActionId;
        if (this.activity.associatedEntityName == "opportunity") {
          this.selectedOpportunity = this.activity.associatedEntityId;
          this.isOpportunity = true;
        } else if (this.activity.associatedEntityName == "Account") {
          this.selectedCustomer = this.activity.associatedEntityId;
          this.isOpportunity = false;
        } else {
          this.isOpportunity = false;
          this.isSalesJob = true;
        }

        this.important = this.activity.priorityCode == 2 ? true : false;
        let entity = {
          id: this.activity.associatedEntityId,
          name: this.activity.associatedEntityName,
          customerId: this.activity.organizationId,
        };
        this.updateRelatedFields(entity, this.activity.associatedEntityName);
      }

      if(this.activity.isShared){
        this.shareWithList = this.activity.sharedWithUsers;
      }

     // this.calculateEfforts();
    }

    if (this.selectedApp == 2) {
      if (this.isOpportunity) {
        this.initFormData("opportunity");
      } else if (this.isSalesJob) {
        this.initFormData("salesjob");
      } else {
        this.initFormData("customer");
      }
      this.isLoading = false;
      this.dataLoaded = true;
    } else {
      if(this.selectedApp==3){
        this.executeAsynchronously(
          [
            this.getAllProjects(null),
          ],
          10
        );
      }else{
        this.executeAsynchronously(
          [
            this.getAllProjects(null),
            this.getAllUsers(null),
            this.getAllUnits(null),
          ],
          10
        );
      }

    }
  }

  setActiveApplications() {
    if (!!this.data.engProData && this.data.engProData.isEngProEnabled) {
      this.engagementProLoggedInUserId = this.data.engProData.engProLoggedInUserId;
      this.applications.push({ id: 1, name: "EngagementPro" });
    }

    if (!!this.data.oppProData && this.data.oppProData.isOppProEnabled) {
      this.applications.push({ id: 2, name: "OpportunityPro" });

    }

    if (!!this.data.espAddon && this.data.isEspEnabled) {
      this.applications.push({ id: 4, name: "Requests" });
    }

    if (!!this.epmConnectionData && this.isEpmEnabled && this.data.isMine)  {
      this.applications.push({ id: 3, name: "MS Project Online" });
    }
  }

  setFormFlags() {
    this.isMine = this.data.isMine;
    this.isESPcomponent = !!this.data.isESPcomponent? this.data.isESPcomponent:false;
    if(this.isESPcomponent){
      this.selectedApp = 4 ;
      this.requestId =this.data.requestId;
    }

    this.isBacklog = this.isMine == null ? true : false;
    this.isAssigned = this.isMine == false? true : false;
    this.isShared = this.formMode =="edit" && !!this.activity && this.activity.isShared ? true : false;
    this.isPlan =
      this.formMode == "edit" &&
      this.isBacklog &&
      !!this.data.action &&
      this.data.action == Actions?.plan
        ? true
        : false;
  }
  updateDueDateTime() {
    if (
      !!this.form.get("dueDate") &&
      this.form.get("dueDate")?.value != "" &&
      this.form.get("dueDate")?.value != null
    ) {
      this.hr = new Date().getHours();
      this.min = new Date().getMinutes();
      this.sec = new Date().getSeconds();
      this.form.get("dueDate")?.value.setHours(this.hr, this.min, this.sec);
    }
  }

  updateRelatedFields(entity:any, type:any) {
    if (type == "opportunity") {
      this.selectedOpportunity = entity.id;
    } else if (type == "salesjob") {
      this.selectedCustomer = entity.id;
    } else {
      this.selectedCustomer = entity.id;
    }
    if (type != "salesjob") {
      this.getCustomerContactsList(entity.customerId);
    }
  }

  getCustomerContactsList(customerId:any) {
    this._activitiesService
      .getCustomerContactsList(customerId, this.data.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callToUsers = resp.result.map((user:any) => {
              return {
                id: user.id,
                name: user.firstName + " " + user.lastName,
              };
            });
          }
        }
      });
  }

  activateType(type: { id: number; name: string; active: boolean }) {
    if(this.selectedApp==2){
      this.resetFields(type.name.toLowerCase());
      this.initFormData(
        type.name.toLowerCase() != "sales job"
          ? type.name.toLowerCase()
          : "salesjob"
      );
    }

    switch (type.name) {
      case "Assigned":
        this.activityTypes[1].active = false;
        this.form.get("maxClaims")?.setValue(null);
        this.form.get("assignedTo") == undefined
        ? this.form.addControl("assignedTo", new FormControl(null))
        : "";
        this.form.removeControl("shareWith");
        this.users.find((val) => val.UserId === -2) ? this.users.shift(): "";
        type.active = true;
        this.isShared=false;
        this.isAssigned = true;
        break;
      case "Shared":
        this.activityTypes[0].active = false;
        this.form.get("notes")?.setValue(null);
        this.form.get("shareWith") == undefined
        ? this.form.addControl("shareWith", new FormControl(null))
        : "";
        this.form.removeControl("assignedTo");
        this.users.forEach(user=> user.selected =false);
        this.isAssigned = false;
        type.active = true;
        this.isShared=true;
        this.executeAsynchronously(
          [
            this.getAllProjects(null),
            this.getAllUsers(null),
            this.getAllUnits(null),
          ],
          10
        );
        // this.users = [];
        break;
      case "Customer":
        this.isSalesJob = false;
        this.isOpportunity = false;
        this.types[0].active = false;
        this.types[2].active = false;
        type.active = true;
        this.form.get("customer") == undefined
          ? this.form.addControl("customer", new FormControl(null))
          : "";
        this.form.removeControl("opportunity");
        this.form.removeControl("salesJob");
        break;

      case "Sales Job":
        this.isSalesJob = true;
        this.isOpportunity = false;
        this.types[0].active = false;
        this.types[1].active = false;
        type.active = true;
        this.form.get("salesJob") == undefined
          ? this.form.addControl("salesJob", new FormControl(null))
          : "";
        this.form.removeControl("opportunity");
        this.form.removeControl("customer");
        break;
      default:
        this.isSalesJob = false;
        this.isOpportunity = true;
        this.types[1].active = false;
        this.types[2].active = false;
        type.active = true;
        this.form.get("opportunity") == undefined
          ? this.form.addControl("opportunity", new FormControl(null))
          : "";
        this.form.removeControl("customer");
        this.form.removeControl("salesJob");
        break;
    }
  }

  resetFields(type: string) {
    if (type == "customer") {
      //this.form.get("opportunity").setValue(null);
      this.selectedOpportunity = null;
      this.oppotunities = [];
    } else {
      // this.form.get("customer").setValue(null);
      this.selectedCustomer = null;
      this.customers = [];
    }
    this.form.get("purpose")?.setValue(null);
    this.callToActions = [];
    this.selectedCallToAction = null;

    if (type != "sales job") {
      this.form.get("callFrom")?.setValue(
          this.data.oppProData.user.firstName +
            " " +
            this.data.oppProData.user.lastName
        );
      this.selectedCallFromUser = this.data.oppProData.user.applicationUserId;
    }

    // this.form.get("dueDate") == undefined
    //   ? this.form.addControl("dueDate", new FormControl(null))
    //   : "";
  }
  initFormData(type: string) {
    this.getCallToActionsAssociatedWithCallToActionModules(type);
    if (type != "salesjob") {
      if (type == "opportunity") {
        this.getOpportunityListForActivities("");
      } else {
        this.searchCustomerByFilter("");
      }

      this.getOpportunityOwners();
    }
  }

  getOpportunityOwners() {
    this._activitiesService
      .getOpportunityOwners(this.data.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callFromUsers = resp.result.map((user:any) => {
              return {
                id: user.applicationUserId,
                name: user.fullName,
              };
            });
          }
        }
      });
  }

  searchCustomerByFilter(keyword: string) {
    this._activitiesService
      .searchCustomerByFilter(
        this.territoryFilter,
        keyword,
        this.data.oppProData
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.customers = resp.result.map((customer:any) => {
              return {
                id: customer.organizationId,
                name: customer.organizationName,
                customerId: customer.organizationId,
              };
            });
          }
        }
      });
  }

  getAllSalesJobListing() {
    // this._activitiesService
    //   .getAllSalesJobListing(this.data.oppProData)
    //   .subscribe((resp:any) => {
    //     if (!!resp) {
    //       if (resp.code === "001" && resp.result.length > 0) {
    //         this.salesJobs = resp.result.map((job) => {
    //           return {
    //             id: job.salesJobId,
    //             name: job.salesJobTitle,
    //           };
    //         });
    //       }
    //     }
    //   });
  }

  getCallToActionsAssociatedWithCallToActionModules(type: string) {
    this._activitiesService
      .getCallToActionsAssociatedWithCallToActionModules(
        type,
        this.data.oppProData
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.callToActions = resp.result.map((action:any) => {
              return {
                id: action.callToActionId,
                name: action.title,
              };
            });
          }
        }
      });
  }

  getOpportunityListForActivities(keyword: string) {
    this._activitiesService
      .getOpportunityListForActivities(
        this.data.oppProData.user.applicationUserId,
        this.data.oppProData.user.organizationId,
        keyword,
        this.data.oppProData
      )
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001" && resp.result.length > 0) {
            this.oppotunities = resp.result.map((opp:any) => {
              return {
                id: opp.opportunityId,
                name: opp.title,
                customerId: opp.customerId,
              };
            });
          }
        }
      });
  }

  getTacticAndUtilizationListByTeam(data: any): Observable<any> {
    const url = `https://stemexess.azurewebsites.net/api/Stemexe/GetTacticAndUtilizationListByTeam`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Stemexe),
    };

    return this._http.post<any>(url, data, options);
  }

  updateSelectedProject(project:any, oneBoard?:any) {
    if(oneBoard == 'oneBoard') {
      this.selectedProject = project[0].id;
    }else {
      this.selectedProject = project.id;
    }

    if(this.selectedApp == 4){
      this.selectedRequestName= project.requestName;
      this.selectedRequestNumber= project.requestNo;
    }


    this.onProjectSelected(this.selectedProject, oneBoard);
  }
  onProjectSelected(projectId:any, oneBoard?:any) {
    if(!!projectId && this.selectedApp != 3 &&  this.selectedApp != 4 ){
        if (this.engagementProLoggedInUserId != null && this.selectedApp == 1) {
          this.engagementProData = this._simplestrataAuthService.engagementProData;
          this.engagementProData.teamId = projectId;
          this.getTacticAndUtilizationListByTeam(
            this.engagementProData
          ).subscribe((resp:any) => {
            this.jobs = resp.result.lookupLists[0].listing.map((record:any) => {
              return {
                id: record.id,
                name: record.title,
                unit: null,
                actualValue: null,
                targetValue: null,
                condition: null,
                definition: null,
              };
            });
            this.tempJobs = this.jobs;
            if(this.formMode == 'edit' && this.jobs.length == 1 && this.activity.tacticId != null) {
              this.form.get("job")?.setValue(this.jobs[0].name);
            }
          });
        } else {
          let data = {
            PageIndex: 1,
            PageSize: 10000000,
            ParentTeamId: projectId,
            Status: 1,
            TagIds: null,
          };
          this._activitiesService.getAllByParent(data).subscribe((resp:any) => {
            if (!!resp) {
              if (resp.ResponseCode === 2000) {
                this.jobs = resp.ResponseResult.Tactics.map((record:any) => {
                  return {
                    id: record.TacticId,
                    name: record.TacticTitle,
                    unit: record.Unit,
                    actualValue: record.ActualValue,
                    targetValue: record.TargetValue,
                    condition: record.condition,
                    definition: record.definition,
                  };
                });
                this.tempJobs = this.jobs;
                this.form.get("job")?.setValue(null);
                // if (this.formMode == 'edit' && this.jobs.length == 1 && this.activity.tacticId != null && oneBoard != 'data') {
                //   this.form.get("job").setValue(this.jobs[0].name);
                // }
                if (this.formMode == 'edit' && this.activity.tacticId != null && oneBoard != 'data') {
                  let selectedJob = this.jobs.filter((obj) => { return obj.id == this.activity.tacticId});
                  this.form.get("job")?.setValue(selectedJob[0].name);
                }
                this.tacticLabelText = resp.ResponseResult.TacticLabelText;
                this.tacticsLabelText = resp.ResponseResult.TacticsLabelText;
              } else {
                this._alertService.error(resp.ResponseMessage, {
                  timeout: 3000,
                });
              }
            }
          });
        }
    }
  }
  onJobSelected(jobId:any) {
    if (!!jobId) {
      if (!this.isBacklog || (this.isBacklog && this.isPlan)) {
        for (var i = 0; i < this.jobs.length; i++) {
          if (this.jobs[i].id == jobId) {
            this.form.get("targetUnit")?.setValue(this.jobs[i].unit);
            this.form.get("actualUnit")?.setValue(this.jobs[i].unit);
            this.form.get("condition")?.setValue(this.jobs[i].condition);
            //this.form.get("actualValue").setValue(this.jobs[i].actualValue);
            //this.form.get("targetValue").setValue(this.jobs[i].targetValue);
            this.form.get("condition")?.setValue(
                this.jobs[i].condition == 1
                  ? "Less Than"
                  : this.jobs[i].condition == 2
                  ? "More Than"
                  : "Equal"
              );
            this.selectedCondition = this.jobs[i].condition;
          }
        }
      }
    } else {
      this.resetJobRelatedField();
    }
  }
  openFileUploader() {
    document.getElementById("wizard-upload-file-details")?.click();
  }
  uploadActivityFile(event:any) {
    if (event.target.files && event.target.files.length > 0) {
      this.isLoadingAttachment = true;
      let file = event.target.files[0];
      this.files.push(file);
      this.attachements.push({
        id: this.attachements.length + 1,
        name: file.name.substr(0, file.name.lastIndexOf(".")),
        size: this._utils.formatFileSize(file.size),
        fileUrl: file.webkitRelativePath,
        type:
          file.type == "image/jpg"
            ? "jpg"
            : file.type == "image/jpeg"
            ? "jpeg"
            : file.type == "image/png"
            ? "png"
            : file.type == "image/gif"
            ? "gif"
            : file.type == "application/msword"
            ? "doc"
            : file.type ==
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ? "docx"
            : file.type == "application/vnd.ms-excel"
            ? "xls"
            : file.type ==
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ? "xlsx"
            : file.type == "application/pdf"
            ? "pdf"
            : file.type == "application/vnd.ms-powerpoint"
            ? "ppt"
            : file.type ==
              "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            ? "pptx"
            : //  attachment.type === 9 ? 'mp3' :
              // attachment.type === 10 ? 'wav' :
              // attachment.type === 11 ? 'mp4' :
              // attachment.type === 12? 'xwav' :

              "unknown",
      });

      this.attachements.reverse();

      this.files.reverse();
      this.isLoadingAttachment = false;
    }
  }

  onChanges(): void {
    if (!this.isBacklog || (this.isBacklog && this.isPlan)) {
      this.form.get("targetUnit")?.valueChanges.subscribe((val) => {
        this.form.get("actualUnit")?.setValue(this.form.get("targetUnit")?.value);
      });

      this.form.get("assignedTo")?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((val) => {
          // this.getAllUsers(val);
          this.getAllProjects(null);
        });

      this.form.get("targetUnit")?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((val:any) => {
          this.getAllUnits(val);
        });

      this.form.get("shareWith")?.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe((val) => {
          if (!this.selectionToggled && val != "" && val != null && typeof val ==='string' ) {
            this.getAllUsers(val);
          } else {
            this.getAllUsers(null);
            this.selectionToggled = false;
          }

          this.shareWithSearch =  typeof val !='string' && val !=null? val.UserName:typeof val ==='string' ? val:null;
        });
    }


    this.form.get("condition")?.valueChanges.subscribe((val) => {
      if (val == "") {
        this.selectedCondition = null;
      }
    });

    this.form.get("job")?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((val) => {
        if (val == "") {
          this.selectedJob = null;
        }
      });

    this.form.get("project")?.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((val:any) => {
        if (val == "") {
          this.selectedProject = null;
        }

      });


    // this.shareWith.valueChanges.subscribe((val) => {
    //    this.form.value.shareWith = val;
    // });
  }

  removeUser(user:any): void {
    if(user.UserId == -2){
      this.shareWithList = [];
      this.users.forEach(user=> user.selected =false);
    }else{
      this.users.find(selectedUser=> selectedUser.UserId == user.UserId).selected =false;
      this.shareWithList = this.shareWithList.filter(sharedUser => sharedUser.UserId != -2 && sharedUser.UserId != user.UserId);
    }
    this.shareWithInput.nativeElement.value = "";
    this.shareWithSearch = null;
    this.isShareWithAllSelected =false;

    this.form.get("shareWith")?.setValue(this.shareWithList);
  }

  selectUser(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.shareWithList.push(event.option.value);
    this.shareWithInput.nativeElement.value = "";
    this.shareWithSearch = null;
    if(this.allUsers.filter((val) => val.UserId != -2).length===this.shareWithList.filter((val) => val.UserId != -2).length){
      this.selectAllUsers();
    }else{
      this.isShareWithAllSelected = false;
    }


    this.form.get("shareWith")?.setValue(this.shareWithList);
  }

  filterUser(value: string): { id: number; name: string }[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(
      (user) => user.UserName.toLowerCase().indexOf(filterValue) > -1
    );
  }

  toggleSelection(event: MatAutocompleteSelectedEvent) {
    this.selectionToggled = true;
    if (event.option.value.selected) {
      if(event.option.value.UserId ==-2){
        this.removeAllUsers();
      }else{
        this.removeUser(event.option.value);
      }
    } else {
      if(event.option.value.UserId ==-2){
        this.selectAllUsers();
      }else{
        this.selectUser(event);
      }
    }
  }




  removeAllUsers(){
    this.users.forEach(user=>user.selected=false);
        this.users.forEach(user=>this.removeUser(user));
        this.shareWithList =[];
        this.isShareWithAllSelected =false;

    this.form.get("shareWith")?.setValue(this.shareWithList);

  }


  selectAllUsers(){
    this.shareWithList =[];
    this.users = this.allUsers;
    this.users.forEach(user=>{
      user.selected=true;
      this.shareWithList.push(user);
    });
    this.shareWithInput.nativeElement.value = "";
    this.shareWithSearch = null;
    this.isShareWithAllSelected =true;

    this.form.get("shareWith")?.setValue(this.shareWithList);
  }

  highlight(name:any) {
    if (!this.shareWithSearch || this.shareWithSearch == "") {
      return name;
    }
    const re = new RegExp(this.shareWithSearch, "gi");
    const html: string = name.replace(
      re,
      `<span class='text-highlight'>${this.shareWithSearch}</span>`
    );

    return html;
  }

  resetJobRelatedField() {
    this.selectedJob = null;
    this.form.get("job")?.setValue(null);
    this.selectedCondition = null;
    this.form.get("condition")?.setValue(null);
    this.form.get("targetValue")?.setValue(null);
    this.form.get("targetUnit")?.setValue(null);
    //this.onProjectSelected(this.selectedProject);
  }

  deleteAttachment(id: number) {
    let attachmentsFiltered = this.attachements.filter((attachment) => {
      return attachment.id !== id;
    });
    this.attachements = attachmentsFiltered;
  }

  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    console.log(this.selectedApp);
    switch (this.selectedApp) {
      case 3:
        if (this.formMode == "new") {
        let data={
          Description:this.form.value.title,
          DueDate	:moment(this.form.value.dueDate).format("LL"),
          Note:this.form.value.notes,
          EpmProjectId:this.selectedProject
        };
        this._activitiesService
              .createEPMActivity(data)
              .subscribe(
                (resp:any) => {
                  if (!!resp) {
                    if (resp.ResponseCode == 2000) {
                      this.cancel();
                      this.isLoading = false;
                      this._alertService.success(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    } else {
                      this._dialogRef.close();
                      this._alertService.error(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    }
                  }
                },
                (error: Error): void => {}
              );
        }else{
          let data={
            Description:this.form.value.title,
            DueDate	:moment(this.form.value.dueDate).format("LL"),
            Note	:this.form.value.notes,
            EpmProjectId:this.selectedProject,
            EpmTaskId:this.activity.epmInfo.TaskId,
            ActualValue:this.form.value.actualValue,
            TargetValue:this.form.value.targetValue,
          };
          this._activitiesService
                .updateEPMActivity(data)
                .subscribe(
                  (resp:any) => {
                    if (!!resp) {
                      if (resp.ResponseCode == 2000) {
                        this.cancel();
                        this.isLoading = false;
                        this._alertService.success(resp?.ResponseMessage, {
                          timeout: 3000,
                        });
                      } else {
                        this._dialogRef.close();
                        this._alertService.error(resp?.ResponseMessage, {
                          timeout: 3000,
                        });
                      }
                    }
                  },
                  (error: Error): void => {}
                );
        }

      break;
      case 2:
        this.updateDueDateTime();
        var callDuration = !!this.effort ? this.effort.effortSum : null;

        if (this.formMode == "new") {
          let data = {
            activityType: "task",
            hasAttachment: false,
            subject: this.form.value.title,
            description: this.form.value.notes,
            callToActionId: this.selectedCallToAction,
            callToActionTitle: this.form.value.purpose,
            callFromId: this.selectedCallFromUser,
            callFromName: this.form.value.callFrom,
            createdDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            ownerId: this.selectedCallFromUser,
            ownerName: this.form.value.callFrom,
            scheduleEnd: moment(this.form.value.dueDate).format(
              "YYYY-MM-DD hh:mm:ss a"
            ),
            scheduleStart: moment(this.form.value.dueDate).format(
              "YYYY-MM-DD hh:mm:ss a"
            ),
            priorityCode: this.important ? 2 : 0,
            durationMinutes: callDuration,
            associatedEntityId: this.isOpportunity
              ? this.selectedOpportunity
              : this.isSalesJob
              ? ""
              : this.selectedCustomer,
            associatedEntityName: this.isOpportunity
              ? "opportunity"
              : this.isSalesJob
              ? "salesjob"
              : "Account",
            isReminderUpdated: false,
            reminderSelectedOption: "never",
            reminderSelectedDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            reminderAddedDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            changeHistoryList: {},
            createdById: this.data.oppProData.user.applicationUserId,
            createdByName:
              this.data.oppProData.user.firstName +
              " " +
              this.data.oppProData.user.lastName,
          };
          this._activitiesService
            .createOppProCall(data, this.data.oppProData)
            .subscribe((resp:any) => {
              if (!!resp) {
                if (resp.code == "001") {
                  this.cancel();
                  this.isLoading = false;
                  this._alertService.success(resp.message, {
                    timeout: 3000,
                  });
                  this.addCallToActionToActivity(resp.result);
                } else {
                  this.isLoading = false;
                  this.cancel();
                  this._alertService.error(resp.message, {
                    timeout: 3000,
                  });
                }
              }
            });
        } else {
          let data = {
            activityId: this.activity.activityId,
            activityType: "task",
            hasAttachment: false,
            subject: this.form.value.title,
            description: this.form.value.notes,
            callToActionId: this.selectedCallToAction,
            callToActionTitle: this.form.value.purpose,
            callFromId: this.selectedCallFromUser,
            callFromName: this.form.value.callFrom,
            createdDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            ownerId: this.selectedCallFromUser,
            ownerName: this.form.value.callFrom,
            scheduleEnd: moment(this.form.value.dueDate).format(
              "YYYY-MM-DD hh:mm:ss a"
            ),
            scheduleStart: moment(this.form.value.dueDate).format(
              "YYYY-MM-DD hh:mm:ss a"
            ),
            priorityCode: this.important ? 2 : 0,
            durationMinutes: callDuration,
            associatedEntityId: this.isOpportunity
              ? this.selectedOpportunity
              : this.isSalesJob
              ? ""
              : this.selectedCustomer,
            associatedEntityName: this.isOpportunity
              ? "opportunity"
              : this.isSalesJob
              ? "salesjob"
              : "Account",
            isReminderUpdated: false,
            reminderSelectedOption: "never",
            reminderSelectedDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            reminderAddedDate: moment
              .utc(new Date())
              .local()
              .format("YYYY-MM-DD hh:mm:ss a"),
            changeHistoryList: {
              entityId: this.activity.activityId,
              entityName: "activity",
              stateChangedBy: this.data.oppProData.user.applicationUserId, // Id of Logged in user
              stateChangedByName:
                this.data.oppProData.user.firstName +
                " " +
                this.data.oppProData.user.lastName,
              lastUpdatedDate: moment
                .utc(new Date())
                .local()
                .format("YYYY-MM-DD hh:mm:ss a"),
              changedItems: this.getChangedItemsHistoryList(),
            },
            createdById: this.data.oppProData.user.applicationUserId,
            createdByName:
              this.data.oppProData.user.firstName +
              " " +
              this.data.oppProData.user.lastName,
            UpdatedById: this.data.oppProData.user.applicationUserId,
            UpdatedByName:
              this.data.oppProData.user.firstName +
              " " +
              this.data.oppProData.user.lastName,
          };
          this._activitiesService
            .editOppProCall(data, this.data.oppProData)
            .subscribe((resp:any) => {
              if (!!resp) {
                if (resp.code == "001") {
                  this.cancel();
                  this.isLoading = false;
                  this._alertService.success(resp.message, {
                    timeout: 3000,
                  });
                  this.updateCallToActionToActivity(resp.result);
                } else {
                  this.cancel();
                  this.isLoading = false;
                  this._alertService.error(resp.message, {
                    timeout: 3000,
                  });
                }
              }
            });
        }
        break;
      default:

        let effort = {
          Hours: this.form.value.effortInHour,
          Minutes: this.form.value.effortInMinute,
          CommentText: this.form.value.comment,
          Status: null,
          CompletedDate:
            this.form.value.logDate != null
              ? moment(this.form.value.logDate).format("LL")
              : null,
          StartTime:
            this.form.value.startTime != null
              ? moment(this.form.value.startTime).format("LLL")
              : null,
          EndTime:
            this.form.value.endTime != null
              ? moment(this.form.value.endTime).format("LLL")
              : null,
        };

        if (this.formMode == "new") {

          let data = {
            Description: this.form.value.title,
            TargetValue: this.form.value.targetValue == null ? 100:this.form.value.targetValue,
            ActualValue: this.form.value.actualValue,
            Unit: this.form.value.actualUnit,
            IsImportant: this.important,
            IsFollowed: this.follow,
            TacticId: this.selectedJob,
            Owner_UserId:
              this.selectedApp == 1 && this.isMine
                ? null
                : this.isMine != null && this.isMine && !this.isBacklog
                ? this.assignedTo
                : this.assignedTo, // this.loggedInUserId removed
            AssignedBy_UserId: this.loggedInUserId,
            DueDate:
              !this.isBacklog && this.form.value.dueDate != null
                ? moment(this.form.value.dueDate).format("LL")
                : null,
            ParentTeamId:this.selectedApp!= 4 ? this.selectedProject: null,
            // ESP_RequestId:this.selectedApp == 4 ? this.selectedProject : null,
            // ESP_RequestNumber:this.selectedApp == 4 ? this.selectedRequestNumber : null,
            // ESP_RequestName:this.selectedApp == 4 ? this.selectedRequestName : null,

            ESP_RequestId:this.applicationId,
            ESP_RequestNumber: this.applicationRequestNo,
            ESP_RequestName: this.applicationRequestName,

            IsShared:this.isShared,
            MaxClaims: this.form.value.maxClaims,
            ShareWithIds:this.getSelectedShareWithIds() ,
            Weight: this.form.value.weight==null?100:this.form.value.weight,
            Note: this.form.value.notes,
            Effort: effort,
            Files: this.files[0],
            // StartDate:
            //   this.form.value.startDate != null
            //     ? moment(this.form.value.startDate).format("LL")
            //     : null,
            Condition: this.selectedCondition == null ? 2 :this.selectedCondition,
          };

          if (this.selectedApp == 0 || this.selectedApp == 4 ) {
            forkJoin([
              this.recurringSubmitData!=null ? this._activitiesService.createRecurring(this.recurringSubmitData):of(null),
              this._activitiesService.create(data)
            ]).subscribe(response=>{
              let resp = response[1];
              if (!!resp) {
                if (resp.ResponseCode == 2000) {
                  this.cancel();
                  this.isLoading = false;
                  this._alertService.success(resp?.ResponseMessage, {
                    timeout: 3000,
                  });
                } else {
                  this.isLoading = false;
                  this._dialogRef.close();
                  this._alertService.error(resp?.ResponseMessage, {
                    timeout: 3000,
                  });
                }
              }

            });

          } else {
            this._activitiesService
              .createEngProActivity(data, this.engagementProLoggedInUserId)
              .subscribe(
                (resp:any) => {
                  if (!!resp) {
                    if (resp.ResponseCode == 2000) {
                      this.cancel();
                      this.isLoading = false;
                      this._alertService.success(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    } else {
                      this._dialogRef.close();
                      this._alertService.error(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    }
                  }
                },
                (error: Error): void => {}
              );
          }
        } else {
          let data = {
            Description: this.form.value.title,
            TargetValue: this.form.value.targetValue,
            ActualValue: this.form.value.actualValue,
            Unit: this.form.value.actualUnit,
            IsImportant: this.important,
            IsFollowed: this.follow,
            TacticId: this.selectedJob,
            Owner_UserId:
              this.selectedApp == 1 && this.isMine
                ? null
                : this.isMine != null && this.isMine && !this.isBacklog
                ? this.loggedInUserId
                : this.assignedTo,
            AssignedBy_UserId: this.loggedInUserId,
            DueDate:this.form.value.dueDate!=null? moment(this.form.value.dueDate).format("LL"):null,
            ParentTeamId:this.selectedApp!= 4 ? this.selectedProject: null,
            ESP_RequestId:this.selectedApp == 4 ? this.selectedProject : null,
            ESP_RequestNumber:this.selectedApp == 4 ? this.selectedRequestNumber : null,
            ESP_RequestName:this.selectedApp == 4 ? this.selectedRequestName : null,
            IsShared:this.isShared,
            MaxClaims: this.form.value.maxClaims,
           ShareWithIds:this.getSelectedShareWithIds(),
            Weight: this.form.value.weight,
            Note: this.form.value.notes,
            Effort: this.effort.effortSum != this.activity.effortSum ? effort :null,
            Files: this.files[0],
            Id: this.activity.id,
            IsPlanned: this.isPlan,
            ReassignReason: this.form.value.reassignReason,
            // StartDate:
            //   this.form.value.startDate != null
            //     ? moment(this.form.value.startDate).format("LL")
            //     : null,

            Condition: this.selectedCondition,
          };

          if (this.formMode == "edit") {
            this._activitiesService
              .update(
                data,
                this.engagementProLoggedInUserId,
                this.isEngProActivity
              )
              .subscribe(
                (resp:any) => {
                  if (!!resp) {
                    if (resp.ResponseCode == 2000) {
                      this.cancel();
                      this.isLoading = false;
                      this._alertService.success(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                     // this.openConfirmCreateDialog();
                    } else {
                      this._dialogRef.close();
                      this._alertService.error(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    }
                  }
                },
                (error: Error): void => {}
              );
          } else {
            this._activitiesService
              .reassign(
                data,
                this.engagementProLoggedInUserId,
                this.isEngProActivity
              )
              .subscribe(
                (resp:any) => {
                  if (!!resp) {
                    if (resp.ResponseCode == 2000) {
                      this.isReassigned = true;
                      this.cancel();
                      this.isLoading = false;
                      this._alertService.success(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                      //this.openConfirmCreateDialog();
                    } else {
                      this._dialogRef.close();
                      this._alertService.error(resp?.ResponseMessage, {
                        timeout: 3000,
                      });
                    }
                  }
                },
                (error: Error): void => {}
              );
          }
        }
        break;
    }
  }

  addCallToActionToActivity(activity: any) {
    let data = {
      entityId: activity.activityId,
      entityType: "Activities",
      callToActionId: this.selectedCallToAction,
      callToActionTitle: this.form.value.purpose,
      createdOn: activity.createdDate,
      createdById: activity.createdById,
      createdByName: activity.createdByName,
    };
    this._activitiesService
      .addCallToActionToActivity(data, this.data.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code == "001") {
            this._alertService.success(resp.message, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(resp.message, {
              timeout: 3000,
            });
          }
        }
      });
  }

  updateCallToActionToActivity(activity: any) {
    let data = {
      entityId: activity.activityId,
      entityType: "Activities",
      callToActionId: this.selectedCallToAction,
      callToActionTitle: this.form.value.purpose,
      updatedOn: moment.utc(new Date()).local().format("YYYY-MM-DD hh:mm:ss a"),
      updatedById: this.data.oppProData.user.applicationUserId,
      updatedByName:
        this.data.oppProData.user.firstName +
        " " +
        this.data.oppProData.user.lastName,
    };
    this._activitiesService
      .updateCallToActionInActivity(data, this.data.oppProData)
      .subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code == "001") {
            this._alertService.success(resp.message, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(resp.message, {
              timeout: 3000,
            });
          }
        }
      });
  }
  getScheduleEnd(dt:any, minutes:any) {
    return moment(dt).add(minutes, "minutes"); //new Date(dt.getTime() + minutes * 60000);
  }
  getChangedItemsHistoryList() {
    let changedItems = [];

    if (this.activity.callFromId != this.selectedCallFromUser) {
      changedItems.push({
        columnName: "ActivityOwnerId",
        currentValueId: this.selectedCallFromUser,
        currentValueName: this.form.value.callFrom,
        descriptiveTitle: "updated",
        previousValueId: this.activity.ownerId,
        previousValueName: this.activity.ownerName,
      });
    }

    if (
      !moment(this.activity.scheduleEnd).isSame(moment(this.form.value.dueDate))
    ) {
      changedItems.push({
        columnName: "ScheduleEndDate",
        currentValueId: 0,
        currentValueName: new Date(this.form.value.dueDate),
        descriptiveTitle: "updated",
        previousValueId: 0,
        previousValueName: new Date(this.activity.scheduleEnd),
      });
    }

    return changedItems;
  }

  executeAsynchronously(functions:any, timeout:any) {
    for (var i = 0; i < functions.length; i++) {
      setTimeout(functions[i], timeout);
    }
    this.isLoading = false;
    this.dataLoaded = true;
  }

  onAppSelected(id:any) {
    if (id == 2) {
      // this.form.removeControl("startDate");
      // this.form.removeControl("dueDate");
      this.form.get("customer") == undefined
        ? this.form.addControl("customer", new FormControl(null))
        : "";
      this.form.get("opportunity") == undefined
        ? this.form.addControl("opportunity", new FormControl(null))
        : "";
      this.form.get("salesJob") == undefined
        ? this.form.addControl("salesJob", new FormControl(null))
        : "";
      this.selectedCallFromUser = this.data.oppProData.user.applicationUserId;
      this.form.get("callFrom")?.setValue(
          this.data.oppProData.user.firstName +
            " " +
            this.data.oppProData.user.lastName
        );
      this.selectedCallFromUserEmail = this.data.oppProData.user.email;
      if (this.isOpportunity) {
        this.initFormData("opportunity");
      } else if (this.isSalesJob) {
        this.initFormData("customer");
      } else {
        this.initFormData("salesjob");
      }
    } else {
      this.jobs = [];
      this.resetJobRelatedField();
      this.form.get("assignedTo")?.setValue(null);
      this.selectedProject = null;
      this.form.get("project")?.setValue(null);
      this.form.get("actualValue")?.setValue(null);
      this.getAllProjects(null);
      this.getAllUsers(null);
      this.getAllUnits(null);

      this.form.removeControl("opportunity");
      this.form.removeControl("customer");
      this.form.removeControl("salesJob");

      // this.form.get("startDate") == undefined
      //   ? this.form.addControl("startDate", new FormControl(null))
      //   : "";

      // this.form.get("dueDate") == undefined
      //   ? this.form.addControl("dueDate", new FormControl(null))
      //   : "";
    }
  }

  getLookUpList(data: any): Observable<any> {
    const url = `https://stemexess.azurewebsites.net/api/Stemexe/GetLookUpList`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.Stemexe),
    };

    return this._http.post<any>(url, data, options);
  }
  getAllProjects(keyword:any) {
    this.isProjectSearch = false;
    this.isJobSearch = false;
    if (this.engagementProLoggedInUserId != null && this.selectedApp == 1) {
      this.getLookUpList(
        this._simplestrataAuthService.engagementProData
      ).subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001") {
            this.projects = resp.result.lookupLists[1].listing.map((record:any) => {
              return {
                id: record.id,
                name: record.title,
              };
            });
            this.tempProjects = this.projects;
            if (this.projects.length == 1 && (this.formMode=='edit' || (this.form.value.project == null && this.formMode=='new'))) {
              this.form.get("project")?.setValue(this.projects[0].name);
              this.updateSelectedProject(this.projects[0]);
            }
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
    }else if (this.data.isEspEnabled != null && this.selectedApp == 4) {
      this._applicationService.getOpenRequestsForMim(1,0).subscribe((resp:any) => {
        if (!!resp) {

            this.projects = resp.applications.map((record:any) => {
              return {
                id: record.id,
                name: record.definitionName +' '+record.applicationNumber,
                requestNo:record.applicationNumber,
                requestName:record.definitionName,
              };
            });

            this.tempProjects = this.projects;
            if(this.isESPcomponent || this.formMode=='edit'){
              this.form.get("project")?.setValue(this.projects.find(project=> project.id == this.data.requestId).name);
              this.updateSelectedProject(this.projects.find(project=> project.id == this.data.requestId));
            }



            if (this.projects.length == 1 && (this.formMode=='edit' || (this.form.value.project == null && this.formMode=='new'))) {
              this.form.get("project")?.setValue(this.projects[0].name);
              this.updateSelectedProject(this.projects[0]);
            }
        }
      });
    } else if (this.isEpmEnabled != null && this.selectedApp == 3) {
      let data={
        name:keyword
      }
      this._activitiesService.searchProjects(data).subscribe((resp:any) => {
        if (!!resp) {

            this.projects = resp.ResponseResult.map((record:any) => {
              return {
               id:record.Id,
               name:record.Name
              };
            });
            this.tempProjects = this.projects;
            if (this.projects.length == 1 && (this.formMode=='edit' || (this.form.value.project == null && this.formMode=='new'))) {
              this.form.get("project")?.setValue(this.projects[0].name);
              this.updateSelectedProject(this.projects[0]);
            }
        }
      });
    }  else {
      let data = {
        itemName: keyword,
        UserId: !this.isMine ? this.assignedTo : this.loggedInUserId,
      };
      this._activitiesService.searchForMySpace(data).subscribe((resp:any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.projects = resp.ResponseResult.map((record:any) => {
              return {
                id: record.Id,
                name: record.Name,
              };
            });
            this.tempProjects = this.projects;
            if (this.projects.length == 1 && (this.formMode=='edit' || (this.form.value.project == null && this.formMode=='new'))) {
              this.selectedProject = this.projects[0].id;
               this.form.get("project")?.setValue(this.projects[0].name);
              this.updateSelectedProject(this.projects[0]);
            }
            if (this.formMode=='edit') {
              this.updateSelectedProject(this.projects.filter((proj) => { return proj.id == this.selectedProject }), 'oneBoard');
            }
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
    }
  }

  getAllUsers(keyword:any) {
    if (this.engagementProLoggedInUserId != null && this.selectedApp == 1) {
      this.getLookUpList(
        this._simplestrataAuthService.engagementProData
      ).subscribe((resp:any) => {
        if (!!resp) {
          if (resp.code === "001") {
            this.users = resp.result.lookupLists[0].listing.map((record:any) => {
              return {
                UserId: record.id,
                UserName: record.title
              };
            });
            if (!!this.activity) {
              this.users.unshift({
                UserId: this.engagementProLoggedInUserId,
                UserName:
                  this.activity.userOwner.UserFirstName +
                  " " +
                  this.activity.userOwner.UserLastName,
              });
            }
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
    } else {
      let data = {
        userName: keyword,
        ExcludeLoggedInUser: this.isPlan || this.isShared ? false : true,
      };
      this._activitiesService.searchUsers(data).subscribe((resp:any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.users = resp.ResponseResult;
            if(this.isShared && this.users.length>0){
              keyword==null? this.allUsers = resp.ResponseResult:'';
              this.users.find((val) => val.UserId === -2) ? "": this.users.unshift(this.shareWithAllOpt);
              this.users.forEach(user=>{
                user.selected = this.shareWithList.find(sharedUser=> sharedUser.UserId == user.UserId)? true: false;
              });

              this.isShareWithAllSelected = this.allUsers.filter((val) => val.UserId != -2).length===this.shareWithList.filter((val) => val.UserId != -2).length?true:false;


            }
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
    }
  }

  getAllUnits(keyword?:any) {
    if (this.engagementProLoggedInUserId != null && this.selectedApp == 1) {
      this.units = [];
    } else {
      let data = {
        name: keyword,
      };
      this._activitiesService.searchUnit(data).subscribe((resp:any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.units = resp.ResponseResult;
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
    }
  }

  openRecuringDialog(): void {
    // const dialogRef = this._dialog.open(RecuringDialog, {
    //   width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
    //   // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
    //   maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
    //   maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",

    //   panelClass:
    //     this.size == "XS" || this.size == "SM"
    //       ? "small-dialog"
    //       : "large-dialog",
    //   data: {
    //     activity: this.form.value,
    //     isMine: this.isMine,
    //     files: this.files[0],
    //     selectedJob: this.selectedJob,
    //     selectedProject:this.selectedApp == 4 ? null: this.selectedProject,
    //     selectedCondition: this.selectedCondition,
    //     selectedApp: this.selectedApp,
    //     important: this.important,
    //     follow: this.follow,
    //     loggedInUserId: this.loggedInUserId,
    //     assignedTo: this.assignedTo,
    //     engProLoggedInUserId: this.engagementProLoggedInUserId,
    //     isEngProActivity: this.isEngProActivity,
    //     requestId:this.selectedApp == 4 ? this.selectedProject : null,
    //     requestNumber:this.selectedApp == 4 ? this.selectedRequestNumber : null,
    //     requestName:this.selectedApp == 4 ? this.selectedRequestName : null,
    //     isShared:this.isShared,
    //     maxClaims:this.form.value.maxClaims,
    //     shareWithIds:this.getSelectedShareWithIds()
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (!!result) {
    //     this.recurringType = result.type;
    //     this.recurringSubmitData= result.submitData;
    //   }
    // });
  }

  openConfirmCreateDialog(): void {
    // const dialogRef = this._dialog.open(ConfirmCreateDialog, {
    //   width: "335px",
    //   data: {
    //     form: this.form.value,
    //     isPlanned: this.isPlan,
    //     isReassigned: this.isReassigned,
    //   },
    // });

    // dialogRef.afterClosed().subscribe(() => {
    //   this.cancel();
    // });
  }

  openLogDialog(): void {
    const dialogRef = this._dialog.open(LogDialog, {
      width:'50%',
      data: {
        activity: this.form.value,
        isForNew: true,
        engProLoggedInUserId: this.engagementProLoggedInUserId,
        isEngProActivity: this.isEngProActivity,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.form.get("effortInHour")?.setValue(result.effortInHour);
        this.form.get("effortInMinute")?.setValue(result.effortInMinute);
        this.form.get("startTime")?.setValue(result.startTime);
        this.form.get("endTime")?.setValue(result.endTime);
        this.form.get("comment")?.setValue(result.comment);
        this.form.get("logDate")?.setValue(result.logDate);
        this.calculateEfforts();
        this.effortLogged = true;
      }
    });
  }
  calculateEfforts() {
    this.effort = {
      effortSum: 0,
      effortInMinute: 0,
      effortInHour: 0,
    };
    if (
      this.form.value.startTime != null &&
      this.form.value.startTime != "" &&
      this.form.value.endTime != null &&
      this.form.value.endTime != ""
    ) {
      let duration = moment.duration(
        moment(this.form.value.endTime, "hh:mm").diff(
          moment(this.form.value.startTime, "hh:mm")
        )
      );
      let minutes = Math.abs(duration.asMinutes());
      this.effort.effortSum += minutes;

      this.form.value.effortInMinute = Math.floor(
        moment
          .duration(
            moment.duration(minutes, "minutes").asHours() -
              Math.floor(moment.duration(minutes, "minutes").asHours()),
            "hours"
          )
          .asMinutes()
      );

      this.form.value.effortInHour = Math.floor(
        moment.duration(minutes, "minutes").asHours()
      );
    } else {
      if (this.form.value.effortInMinute != null) {
        this.effort.effortSum += this.form.value.effortInMinute;
      }

      if (this.form.value.effortInHour != null) {
        this.effort.effortSum += moment
          .duration(this.form.value.effortInHour, "hours")
          .asMinutes();
      }
    }
    this.effort.effortInHour = Math.floor(
      moment.duration(this.effort.effortSum, "minutes").asHours()
    );

    this.effort.effortInMinute = Math.floor(
      moment
        .duration(
          moment.duration(this.effort.effortSum, "minutes").asHours() -
            Math.floor(
              moment.duration(this.effort.effortSum, "minutes").asHours()
            ),
          "hours"
        )
        .asMinutes()
    );


  }

  // toggleSelection(id) {
  //   if (id == -2) {
  //     this.toggleAllSelection();
  //   } else {
  //     this.toggleItem();
  //   }
  // }


  // toggleAllSelection() {
  //       if (
  //         this.shareWithList.find((val) => val.UserId === -2) &&
  //         !this.isShareWithAllSelected
  //       ) {
  //         this.shareWithList=[
  //           ...this.users.map((item) => item),
  //           //{ id: -2, name: "All" },
  //         ];
  //         this.isShareWithAllSelected = true;
  //       } else {
  //         this.shareWithList=[];
  //         this.isShareWithAllSelected = false;
  //       }
  // }

  // toggleItem() {
  //       this.shareWith.patchValue(
  //         this.shareWith.value.filter((val) => val.UserId != -2)
  //       );
  //       this.isShareWithAllSelected = false;

  // }

  getSelectedShareWithIds() {
    let tempArr:any[] = [];
      this.shareWithList.forEach((item) => {
        if (item.UserId != -2) {
        tempArr.push(item.UserId);
        }
      });
    return tempArr.length > 0 ? tempArr : null;
  }

//   findInvalidControls() {
//     const invalid = [];
//     const controls = this.form.controls;
//     for (const name in controls) {
//         if (controls[name].invalid) {
//             invalid.push(name);
//         }
//     }
//     return invalid;
// }
dropdownFilter(keyword:any) {
  if(keyword == "project") {
    this.isProjectSearch = true;
    let searchedName = this.tempProjects.filter(obj => {
      let name = obj.name.toLowerCase().trim();
      //if (name.includes(this.projectSearchKeyWord.toLowerCase().trim())) {
        let searchKeyWord = this.form.value.project;
        searchKeyWord = searchKeyWord.toLowerCase().trim();
      if (name.includes(searchKeyWord)) {
        return true;
      } else {
        return false;
      }
    });
    this.projects = searchedName;
  } else if(keyword == "job") {
    this.isJobSearch = true;
    let searchKeyWord = this.form.value.job;
        searchKeyWord = searchKeyWord.toLowerCase().trim();
    let searchedName = this.tempJobs.filter(obj => {
      let name = obj.name.toLowerCase().trim();
      if (name.includes(searchKeyWord)) {
        return true;
      } else {
        return false;
      }
    });
    this.jobs = searchedName;
  }
}
}
