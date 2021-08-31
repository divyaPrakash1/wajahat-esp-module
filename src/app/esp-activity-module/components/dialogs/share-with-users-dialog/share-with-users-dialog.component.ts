import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as moment from 'moment';
import { delay } from 'rxjs/operators';
import { SCREEN_SIZE } from "../../../services/shared.enums";
import { Activity } from '../../../models/activity';
import { ActivitiesService } from '../../../services/activities.service';

import {
  Definitions,
  Conditions,
  EntityTypes,
  Actions,
  Status,
} from "../../../enums/enums";
import { forkJoin } from 'rxjs';
//import { response } from 'express';
import { Category } from '../../../models/category';
import { Tactic } from '../../../models/tactic';
import { ResizeService } from '../../../../esp-activity-module/services/resize.service';
import { AlertService } from '../../../../esp-activity-module/alert/alert.service';
// import { AlertService } from 'src/app/esp-activity-module/alert/alert.service';
// import { ResizeService } from 'src/app/esp-activity-module/services/resize.service';

@Component({
  selector: 'xcdrs-share-with-users-dialog',
  templateUrl: './share-with-users-dialog.component.html',
  styleUrls: ['./share-with-users-dialog.component.scss']
})
export class ShareWithUsersDialogComponent implements OnInit {
  size!: string;
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  isError: boolean = false;
  users:any[]=[];
  shareWithAllOpt = {
    UserId: -2,
    UserName: "Share with all",
    Position:null,
    selected:false,
    // hasClaimed: false,
    // profilePictureUrl:null
  };
  search:string='';
  isShareWithAllSelected:boolean=false;
  activity!:Activity;
  selectedUsers:any=[];
  textSizeRatio:number = 2.5;
  constructor(
    private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<ShareWithUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activityId:string;
      activityAppType:any;
      engagementProLoggedInUserId:any;
      isEngProActivity:boolean
    }) {
      this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
        this.size = SCREEN_SIZE[x];
      });
    }

  ngOnInit(): void {

    this.isLoading=true;
    forkJoin([
      this._activitiesService
      .getActivityDetails(
        this.data.activityId.toString(),
        this.data.engagementProLoggedInUserId,
        this.data.activityAppType == 1
      ),
      this._activitiesService.searchUsers({
        userName: null,
        ExcludeLoggedInUser: false,
      })
    ]).subscribe(resp=>{
      if (!!resp) {
        if (resp[0].ResponseCode == 2000) {

          this.activity = new Activity();
          this.activity.activityType = "task";
          this.activity.id = resp[0].ResponseResult.Id;
          this.activity.requestId =resp[0].ResponseResult.ESP_RequestId;
          this.activity.tacticLabelText = resp[0].ResponseResult.TacticLabelText;
          this.activity.tacticsLabelText =
            resp[0].ResponseResult.TacticsLabelText;
          this.activity.description = resp[0].ResponseResult.Description;
          this.activity.targetValue = resp[0].ResponseResult.TargetValue;
          this.activity.actualValue = resp[0].ResponseResult.ActualValue;
          this.activity.createdBy_UserId =
            resp[0].ResponseResult.CreatedBy_UserId;
          this.activity.score = resp[0].ResponseResult.Score;
          this.activity.progressStatus = resp[0].ResponseResult.IsRejected
            ? "Rejected"
            : resp[0].ResponseResult.Status == 4 &&
              !resp[0].ResponseResult.IsReassigned
            ? "Cancelled"
            : resp[0].ResponseResult.Status == 4 &&
              resp[0].ResponseResult.IsReassigned
            ? "Reassigned"
            : resp[0].ResponseResult.Status == 2
            ? "Done"
            : resp[0].ResponseResult.ActualValue == null
            ? "Not Started"
            : "In progress";
          this.activity.progressStatusColor = resp[0].ResponseResult.IsRejected
            ? "#EB487F"
            : resp[0].ResponseResult.Status == 4
            ? "#EB487F"
            : resp[0].ResponseResult.Status == 2
            ? "#33BA70"
            : resp[0].ResponseResult.ActualValue == null
            ? "#8795b1"
            : "#00a3ff";
          this.activity.dueDate =
            resp[0].ResponseResult.DueDate != ''
              ? moment(resp[0].ResponseResult.DueDate).format("DD MMM YYYY")
              : '';
          this.activity.effortSum = resp[0].ResponseResult.EffortSum;
          this.activity.effortInHour = Math.floor(
            moment
              .duration(resp[0].ResponseResult.EffortSum, "minutes")
              .asHours()
          );
          //resp[0].ResponseResult.EffortInHour;
          this.activity.effortInMinute = Math.floor(
            moment
              .duration(
                moment
                  .duration(resp[0].ResponseResult.EffortSum, "minutes")
                  .asHours() -
                  Math.floor(
                    moment
                      .duration(resp[0].ResponseResult.EffortSum, "minutes")
                      .asHours()
                  ),
                "hours"
              )
              .asMinutes()
          ); //resp[0].ResponseResult.EffortInMinute;
          this.activity.unit = resp[0].ResponseResult.Unit;
          this.activity.weight = resp[0].ResponseResult.Weight;
          this.activity.isPlanned = resp[0].ResponseResult.IsPlanned;

          this.activity.parentBoardId = resp[0].ResponseResult.ParentBoardId;
          this.activity.parentBoardName = resp[0].ResponseResult.ParentBoardName;
          this.activity.status = resp[0].ResponseResult.Status;
          this.activity.createdBy = resp[0].ResponseResult.CreatedBy;

          this.activity.creationDate =
            resp[0].ResponseResult.CreationDate != ''
              ? moment(resp[0].ResponseResult.CreationDate).format("DD MMM YYYY")
              : '';
          this.activity.reminder = resp[0].ResponseResult.Reminder;
          //this.activity.checkPoint = resp[0].ResponseResult.CheckPoint;
          this.activity.checkPointId =
            resp[0].ResponseResult.CheckPoint_CheckPointId;
          this.activity.tacticId = resp[0].ResponseResult.Tactic_TacticId;
          if (this.activity.tacticId != null) {
            this.activity.tactic = new Tactic();
            this.activity.tactic.id = this.activity.tacticId;
            this.activity.tactic.title =
              resp[0].ResponseResult.Tactic.TacticTitle;

            if (
              resp[0].ResponseResult.Tactic.TacticCategory_CategoryId != null
            ) {
              this.activity.tactic.category = new Category();
              if (!!resp[0].ResponseResult.Tactic.category) {
                this.activity.tactic.category.id =
                  resp[0].ResponseResult.Tactic.category.Id;
                this.activity.tactic.category.text =
                  resp[0].ResponseResult.Tactic.category.Text;
              }
            }

            this.activity.tactic.unit = resp[0].ResponseResult.Tactic.Unit;


            //this.activity.tactic.weight=resp[0].ResponseResult.Tactic.Weight;
            this.activity.tactic.condition =
              resp[0].ResponseResult.Tactic.condition == Conditions.Equal
                ? "Equal"
                : resp[0].ResponseResult.Tactic.condition == Conditions.LessThan
                ? "Less Than"
                : "More Than";
            this.activity.tactic.definition =
              resp[0].ResponseResult.Tactic.definition == Definitions.Average
                ? "Average"
                : resp[0].ResponseResult.Tactic.definition == Definitions.Last
                ? "Last"
                : "Sum";
          } else {
            this.activity.condition =
              resp[0].ResponseResult.Condition == Conditions.Equal
                ? "Equal"
                : resp[0].ResponseResult.Condition == Conditions.LessThan
                ? "Less Than"
                : "More Than";
          }

          this.activity.commentCount = resp[0].ResponseResult.CommentCount;

          this.activity.isCascading =
            resp[0].ResponseResult.IndicatorIsCascading;
          this.activity.labelGroupId = resp[0].ResponseResult.LabelGroupId;
          this.activity.cascadeTacticParentName =
            resp[0].ResponseResult.CascadeTacticParentName;
          this.activity.owner_UserId = resp[0].ResponseResult.Owner_UserId;
          this.activity.userOwner = resp[0].ResponseResult.UserOwner;
          this.activity.fieldCount = resp[0].ResponseResult.FieldCount;
          this.activity.attachmentCount = resp[0].ResponseResult.AttachmentCount;
          this.activity.isSigned = resp[0].ResponseResult.IsSigned;
          this.activity.assignedBy_UserId =
            resp[0].ResponseResult.AssignedBy_UserId;
          this.activity.assignedBy = resp[0].ResponseResult.AssignedBy;
          this.activity.relationCount = resp[0].ResponseResult.RelationCount;
          this.activity.isLocked = resp[0].ResponseResult.IsLocked;
          this.activity.isFollowed = resp[0].ResponseResult.IsFollowed;
          this.activity.isImportant = resp[0].ResponseResult.IsImportant;
          this.activity.isAccepted = resp[0].ResponseResult.IsAccepted;
          this.activity.isApproved = resp[0].ResponseResult.IsApproved;
          this.activity.completedDate =
            resp[0].ResponseResult.CompletedDate != ''
              ? moment(resp[0].ResponseResult.CompletedDate).format(
                  "DD MMM YYYY"
                )
              : '';
          this.activity.completedDateAsDate = new Date(
            resp[0].ResponseResult.CompletedDate
          );
          this.activity.note = resp[0].ResponseResult.Note;
          this.activity.history = resp[0].ResponseResult.History.map(
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
          this.activity.respEfforts =  resp[0].ResponseResult.Efforts;
          this.activity.efforts = resp[0].ResponseResult.Efforts.map(
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
          this.activity.reassignReason = resp[0].ResponseResult.re

          this.activity.respAttachments = resp[0].ResponseResult.Attachments
          this.activity.attachments = resp[0].ResponseResult.Attachments.map(
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
          this.activity.sharedStats= resp[0].ResponseResult.SharedStats;
          this.activity.isShared= resp[0].ResponseResult.IsShared;
          this.activity.maxClaims= resp[0].ResponseResult.MaxClaims;
          this.activity.totalClaims = resp[0].ResponseResult.TotalClaims;
          this.activity.sharedWithUsers = !! resp[0].ResponseResult.IsShared && resp[0].ResponseResult.SharedWithUsers.length>0? resp[0].ResponseResult.SharedWithUsers.map((user:any)=>{
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

          //this.activity.isSharedByloggedIn = resp[0].ResponseResult.IsShared==true  &&  resp[0].ResponseResult.AssignedBy_UserId == this.loggedInUserId? true:false;
          this.activity.requestId= resp[0].ResponseResult.ESP_RequestId;
          this.activity.requestNumber= resp[0].ResponseResult.ESP_RequestNumber;
          this.activity.requestName= resp[0].ResponseResult.ESP_RequestName;
          this.activity.isReassigned = resp[0].ResponseResult.IsReassigned;
          this.activity.owner_UserId = resp[0].ResponseResult.Owner_UserId;




          this.selectedUsers = this.activity.sharedWithUsers;

        }

        if (resp[1].ResponseCode === 2000) {
          this.users = resp[1].ResponseResult;
            this.users.forEach(user=>{
              user.selected =this.selectedUsers.find((sharedUser:any)=> sharedUser.UserId == user.UserId)? true: false;
            });

            if(this.users.length===this.selectedUsers.length){
              this.isShareWithAllSelected = true;
            }else{
              this.isShareWithAllSelected =false;
            }
        }


        this.isError=false;
        this.isLoading=false;
        this.dataLoaded=true;

      }
    })
  }



  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {

    let data = {
      Description: this.activity.description,
      TargetValue: this.activity.targetValue,
      ActualValue: this.activity.actualValue,
      Unit: this.activity.unit,
      IsImportant: this.activity.isImportant,
      IsFollowed: this.activity.isFollowed,
      TacticId: this.activity.tacticId,
      Owner_UserId:this.activity.owner_UserId,
      AssignedBy_UserId:this.activity.assignedBy_UserId,
      DueDate:this.activity.dueDate,
      ParentTeamId:this.activity.parentBoardId,
      ESP_RequestId:this.activity.requestId,
      ESP_RequestNumber:this.activity.requestNumber,
      ESP_RequestName:this.activity.requestName,
      IsShared:this.activity.isShared,
      MaxClaims: this.activity.maxClaims,
      ShareWithIds:this.getSelectedShareWithIds(),
      Weight:this.activity.weight,
      Note:this.activity.note,
      Effort: this.activity.respEfforts,
      Files: this.activity.respAttachments,
      Id: this.activity.id,
      IsPlanned: this.activity.isPlanned,
      // ReassignReason:this.activity.reassignReason,
      Condition: this.activity.condition == "Equal" ? Conditions.Equal
      : this.activity.condition == "Less Than"? Conditions.LessThan: Conditions.MoreThan,
    };

    this._activitiesService
    .update(
      data,
      this.data.engagementProLoggedInUserId,
      this.data.isEngProActivity
    )
    .subscribe(
      (resp) => {
        if (!!resp) {
          if (resp.ResponseCode == 2000) {
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
            this._dialogRef.close();
            this.isLoading = false;
          } else {
            this._dialogRef.close();
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      },
      (error: Error): void => {}
    );

  }

  getSelectedShareWithIds() {
    let tempArr:any = [];
      this.selectedUsers.forEach((item:any) => {
        if (item.UserId != -2) {
        tempArr.push(item.UserId);
        }
      });
    return tempArr.length > 0 ? tempArr : null;
  }

  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
    this.getAllUsers(this.search);
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

  getAllUsers(keyword:any) {
      this.isLoading=true;
      let data = {
        userName: keyword,
        ExcludeLoggedInUser: false,
      };
      this._activitiesService.searchUsers(data).subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.users = resp[0].ResponseResult;
            //  this.users.unshift(this.shareWithAllOpt);
              this.users.forEach(user=>{
                user.selected =this.selectedUsers.find((sharedUser:any)=> sharedUser.UserId == user.UserId)? true: false;
              });

              if(this.users.length===this.selectedUsers.length){
                this.isShareWithAllSelected = true;
              }else{
                this.isShareWithAllSelected =false;
              }

              this.isError=false;
            this.isLoading=false;
            this.dataLoaded=true;
          } else {

            this.isError=false;
            this.isLoading=false;
            this.dataLoaded=true;
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });

  }



  toggleAllSelection(ev:any) {
        if (ev.checked) {
          this.users.forEach(user=>user.selected =true);
          this.selectedUsers=this.users;
          this.isShareWithAllSelected = true;
        } else {
          this.users.forEach(user=>user.selected =false);
          this.selectedUsers=[];
          this.isShareWithAllSelected = false;
        }
  }

  toggleItem(ev:any) {
    if(ev.checked){
      this.users.find(user=>user.UserId == ev.source.value.UserId).selected=true;
      this.selectedUsers = this.users.filter(user=> user.selected);
    }else{
      this.users.find(user=>user.UserId == ev.source.value.UserId).selected=false;
      this.selectedUsers = this.selectedUsers.filter((user:any)=>user.UserId !=  ev.source.value.UserId);
    }

    if(this.users.filter(user=> user.UserId != -2).length ===  this.selectedUsers.filter((user:any)=> user.UserId != -2).length){
      this.isShareWithAllSelected = true;
    }else{
      this.isShareWithAllSelected = false;
    }
  }

}
