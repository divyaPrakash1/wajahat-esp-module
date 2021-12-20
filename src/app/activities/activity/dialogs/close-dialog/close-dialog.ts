import { Component, Inject, OnInit } from "@angular/core";
import { Activity } from "../../models/activity";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ConfirmCloseDialog } from "../confirm-close-dialog/confirm-close-dialog";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import * as moment from "moment";
import { delay } from "rxjs/operators";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { Router } from "@angular/router";
import { Conditions, Definitions } from '../../enums';
import { Category } from '../../models/category';
import { Tactic } from '../../models/tactic';
import { DateAdapter } from "@angular/material/core";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
@Component({
  selector: "xcdrs-close-dialog",
  templateUrl: "./close-dialog.html",
  styleUrls: ["./close-dialog.scss"],
})
export class CloseDialog implements OnInit {
  closeOptions: { id: number; name: string }[] = [
    { id: 0, name: "Done" },
    { id: 1, name: "Cancelled" },
  ];

  closeAs: number = 0;
  loggedActuals: number;
  target: number;
  size: string;
  form: FormGroup;
  activity: Activity;
  oldActivityData: Activity;
  isLoading: boolean = false;
  dataLoaded:boolean =false;
  actualValue:any;
  isArabic: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ActivityResizeService,
    private _router: Router,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<CloseDialog>,
    private adapter: DateAdapter<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activityId:any;
      activityType: any;
      action: number;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
      isESPcomponent:boolean;
      isMyspace:boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    // moment.lang("en");
    this.getDetails(this.data.activityId);
  }

  getLanguage() {
    let currLang = 'en';
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
    currLang = lang ? lang.locale : currLang;
    // this.adapter.setLocale(currLang);
  }


  getDetails(activityId: string) {
    this.isLoading=true;
    this._activitiesService
      .getActivityDetails(
        activityId,
        this.data.engProLoggedInUserId,
        this.data.activityType == 1
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode == 2000) {
            this.activity = new Activity();
            this.activity.activityType = "task";
            this.activity.id = resp.ResponseResult.Id;
            this.activity.appType = this.data.activityType;

            this.activity.requestId =resp.ResponseResult.ESP_RequestId;
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
              (history) => {
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
              (effort) => {
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
              (attachment) => {
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
            this.activity.sharedStats= resp.ResponseResult.SharedStats;
            this.activity.isShared= resp.ResponseResult.IsShared;
            this.activity.maxClaims= resp.ResponseResult.MaxClaims;
            this.activity.totalClaims = resp.ResponseResult.TotalClaims;        
            this.activity.sharedWithUsers = !! resp.ResponseResult.IsShared && resp.ResponseResult.SharedWithUsers.length>0? resp.ResponseResult.SharedWithUsers.map(user=>{
              return {
                UserId:user.Id,
                UserName:user.Name,
                Position:user.Position,
                selected:true,
                hasClaimed: user.HasClaimed,
                profilePictureUrl: user.ProfilePictureUrl
              }
            }):[];
            this.activity.sharedWithUsersClaimed = this.activity.sharedWithUsers.filter(user=>user.hasClaimed);
            this.activity.sharedWithUsersNotClaimed = this.activity.sharedWithUsers.filter(user=>!user.hasClaimed);
          
            this.activity.requestId= resp.ResponseResult.ESP_RequestId;
            this.activity.requestNumber= resp.ResponseResult.ESP_RequestNumber;
            this.activity.requestName= resp.ResponseResult.ESP_RequestName;
            this.activity.isReassigned = resp.ResponseResult.IsReassigned;
            this.activity.owner_UserId = resp.ResponseResult.Owner_UserId;


            this.initFormData();
            this.onChanges();
            // moment.lang("ar");
            
            this.isLoading=false;
            this.dataLoaded=true;
          }
        
        }
      });
  }


  initFormData(){
    this.actualValue = this.activity.actualValue;
    this.activity.actualValue = this.activity.actualValue;
    // this.activity.actualValue == null
    //   ? this.activity.targetValue
    //   : this.activity.actualValue;

  this.loggedActuals = this.activity.actualValue;
  this.target = this.activity.targetValue;

    this.form = this._fb.group({
      id: new FormControl(this.activity.id),
      description: new FormControl(this.activity.description),
      status: new FormControl(2),
      actualValue: new FormControl(this.activity.actualValue),
      closeDate: new FormControl(
        this.activity.completedDate == null
          ? new Date(moment().format("LL"))
          : new Date(moment(this.activity.completedDate).format("LL")),
        [Validators.required]
      ),
      startTime: new FormControl(""),
      endTime: new FormControl(""),
      effortInHour: new FormControl(null,
        [Validators.max(200)]
      ),
      effortInMinute: new FormControl(null,
        [Validators.max(59)]
      ),
      comment: new FormControl(""),
      closeAs: new FormControl(this.closeAs),
    });
    
  }

  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
    this.form.get("comment").setValue(null);
    this.activity.closeComment = null;
  }

  submit() {
    // moment.lang("en");
    this.isLoading = true;
    let data = {
      IndicatorId: this.form.value.id,
      ActualValue: this.form.value.actualValue ? this.form.value.actualValue : this.activity.actualValue == null ? this.activity.targetValue : this.activity.actualValue,
      EffortInHour: this.form.value.effortInHour,
      EffortInMinute: this.form.value.effortInMinute,
      CommentText: this.form.value.comment,
      Status: this.form.value.status,
      CompletedDate: moment(this.form.value.closeDate).format("LL"),
      StartTime: this.form.value.startTime,
      EndTime: this.form.value.endTime,
    };
    //this.openConfirmCloseDialog(data);

    this._activitiesService
      .updateActualValue(
        data,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            // moment.lang("ar");
            if (resp.ResponseCode == 2000) {
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
              this._dialogRef.close(true);
              this.isLoading = false;
              // if(this.data.isESPcomponent){
              //   this._router.navigate([`pages/activities`]);
              // }else{
              //   this._router.navigate([`pages/applications/${this.activity.requestId}?my=${this.data.isMyspace}`]);
              // }
            } else {
              this._dialogRef.close();
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });

              this.isLoading = false;
            }
          }
        },
        (error: Error): void => {}
      );
  }
  updateCloseOption(id) {
    this.closeAs = id;
    this.form.value.closeAs = this.closeAs;
    if (this.closeAs == 1) {
      this.form.value.status = 4;
      this.submit();
    } else {
      this.form.value.status = 2;
    }
  }

  openConfirmCloseDialog(submitData): void {
    const dialogRef = this._dialog.open(ConfirmCloseDialog, {
      width: "370px",
      data: {
        form: this.form.value,
        submitData: submitData,
        engProLoggedInUserId: this.data.engProLoggedInUserId,
        isEngProActivity: this.data.isEngProActivity,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.cancel();
    });
  }

  onChanges(): void {
    this.form.get("effortInHour").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        this.form.get("startTime").setValue(null);
        this.form.get("endTime").setValue(null);
      }
    });

    this.form.get("effortInMinute").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        this.form.get("startTime").setValue(null);
        this.form.get("endTime").setValue(null);
      }
    });

    this.form.get("startTime").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        this.form.get("effortInHour").setValue(null);
        this.form.get("effortInMinute").setValue(null);
      }
    });

    this.form.get("endTime").valueChanges.subscribe((val) => {
      if (val != "" && val != null) {
        this.form.get("effortInHour").setValue(null);
        this.form.get("effortInMinute").setValue(null);
        this.isValidEndDate();
      }
    });
  }

  isValidEndDate() {
    let isValid =
      this.form.get("endTime").value != null &&
      moment(this.form.get("startTime").value, "hh:mm a").isBefore(
        moment(this.form.get("endTime").value, "hh:mm a")
      );

    return !isValid
      ? this.form.get("endTime").setErrors({ incorrect: true })
      : null;
  }
}
