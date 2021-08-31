import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
// import { AlertService } from 'app/esp-activity-module/alert/alert.service';
// import { Actions, ActiveTab } from 'app/esp-activity-module/enums/enums';
// import { ActivitiesService } from 'app/esp-activity-module/services/activities.service';
// import { SharedActivityDataService } from 'app/esp-activity-module/services/shared-activity-data.service';
import * as moment from 'moment';
import { ActivityDialog } from '../dialogs/activity-dialog/activity-dialog';
import { CloseDialog } from '../dialogs/close-dialog/close-dialog';
import { LogDialog } from '../dialogs/log-dialog/log-dialog';
//import { OppProDialog } from '../dialogs/opp-pro-dialog/opp-pro-dialog';
import { Location } from '@angular/common';
import { RejectDialog } from '../dialogs/reject-dialog/reject-dialog';
import { ConfirmDeleteDialog } from '../dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ScheduleDueDateDialog } from '../dialogs/schedule-due-date-dialog/schedule-due-date-dialog';
import { AlertService } from '../../alert/alert.service';
import { Actions, ActiveTab } from '../../enums/enums';
import { ActivitiesService } from '../../services/activities.service';
import { SharedActivityDataService } from '../../services/shared-activity-data.service';
@Component({
  selector: 'xcdrs-activities-actions',
  templateUrl: './activities-actions.component.html',
  styleUrls: ['./activities-actions.component.scss']
})
export class ActivitiesActionsComponent implements OnInit {

  @Input() activity: any;
  @Input() actions: any;
  @Input() loggedInUserId: any;
  @Input() activeTab: any;
  @Input() engProLoggedInUserId: any;
  @Input() size: any;
  @Input() oppProData:any;
  @Input() espAddon:any;
  @Input() isMyspace:boolean | undefined;
  @Input() isESPcomponent:boolean=false;
  isLoading:boolean=false;
  dataLoaded:boolean=false;

  activeTabType = {
    Mine : 0,
    Following : 1,
    Backlog : 2,
    User : 3,
    Shared:4,
    Details:5
  };

  editAction:any={id: 2,
    isShow: true,
    label: 'Edit',
    name: 'edit'};

  @Output() reload: EventEmitter<boolean> = new EventEmitter<boolean>();

  preURL = localStorage.getItem('preURL');
  constructor(
    private _activitiesService: ActivitiesService,
    private _router: Router,
    private _alertService: AlertService,
    public _dialog: MatDialog,
    private _location: Location,
    private sharedActivity:SharedActivityDataService
    ) { }

  ngOnInit(): void {
    if(this.activity.appType == 1 && this.actions.length>0 && !! this.actions.find((action:any)=>action.id == Actions.unplan) ){
       this.actions.find((action:any)=>action.id == Actions.unplan).isShow = false;
    }
    // console.log("activity", this.activity);
    // console.log("actions", this.actions);
    // console.log("loggedInUserId", this.loggedInUserId);
    // console.log("activeTab", this.activeTab);
    // console.log("engProLoggedInUserId", this.engProLoggedInUserId);
    // console.log("size", this.size);
    // console.log("oppProData", this.oppProData);
    // console.log("espAddon", this.espAddon);
    // console.log("isMyspace", this.isMyspace);
    // console.log("isESPcomponent", this.isESPcomponent);
  }

  doAction(action:any) {
    switch (action.id) {
      case Actions.edit:
        this.openActivityDialog("edit", Actions.edit);
        break;
      case Actions.reassign:
        this.openActivityDialog("reassign");
        break;
      case Actions.completeActivity:
        this.openCloseDialog(Actions.completeActivity);
        break;
      case Actions.cancelActivity:
        this.cancelActivity();
        break;
      case Actions.delete:
        this.deleteActivity();
        break;
      case Actions.logActual:
        this.openLogDialog();
        break;
      case Actions.reopen:
        this.reopenActivity();
        break;
      case Actions.accept:
      case Actions.approve:
        this.doAcceptAction();
        break;
      case Actions.reject:
        this.doRejectAction();
        break;
      case Actions.plan:
        this.openActivityDialog("edit", Actions.plan);
        break;
      case Actions.unplan:
        this.unplanActivity();
        break;
      case Actions.share:
          // this.openActivityDialog("edit", activity, Actions.share);
          this.openShareWithUsersDialog();
          break;
      case Actions.claim:
            this.claimActivity();
            break;
      case Actions.decideLater:

              this.isLoading = true;
              this._router.navigate([`pages/activities`]);
              this.isLoading = false;
            break;
      case Actions.stopClaim:
              this.stopClaimActivity();
               break;
      case Actions.cancleClaim:
              this.cancleClaimActivity();
              break;
      case Actions.completeClaim:
                this.completeClaimActivity();
                 break;
      case Actions.doToday:
        this.setDueDateToday();
        break;
      case Actions.schedule:
        this.openScheduleDueDateDialog(true);
        break;
        case Actions.expandDueDate:
        this.openScheduleDueDateDialog(false);
          break;
          case Actions.sendReminder:
            this.sendReminderViaChat();
              break;
      }
  }

  sendReminderViaChat(){
    this._router.navigate([`pages/messages`]);
    this.sharedActivity.activityData.next(this.activity);
  }

  doFollow(activity:any) {
    //this.isElementBtnClicked = true;
    if (!activity.isFollowed) {
      this._activitiesService
        .follow(activity.id, this.engProLoggedInUserId, activity.appType == 1)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isFollowed = !activity.isFollowed;
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });

              //this.isElementBtnClicked = false;
            } else {
              //this.isElementBtnClicked = false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      this._activitiesService
        .unfollow(activity.id, this.engProLoggedInUserId, activity.appType == 1)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isFollowed = !activity.isFollowed;
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
              //this.isElementBtnClicked = false;
            } else {
              //this.isElementBtnClicked = false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  toggleImportant(activity:any) {
      this._activitiesService
        .toggleImportant(activity.id, this.engProLoggedInUserId, activity.appType == 1)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isImportant = !activity.isImportant;
              this._alertService.success(resp.ResponseMessage, {
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


  setDueDateToday(){
    let data = {
      id: this.activity.id,
      dueDate: moment(new Date()).format("LL"),
    };
    this._activitiesService
      .UpdateDueDate(data, this.engProLoggedInUserId, this.activity.appType == 1)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.reload.emit(true);
            this._alertService.success(resp.ResponseMessage, {
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

  openScheduleDueDateDialog(isBacklog:boolean){
    const dialogRef = this._dialog.open(ScheduleDueDateDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      height: this.size == "XS" || this.size == "SM" ? "100%" : "416px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activity: this.activity,
        engProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.activity.appType == 1 ? true : false,
        isBacklog:isBacklog
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.reload.emit(true);
    });
  }

  openCloseDialog(action:any): void {
    const dialogRef = this._dialog.open(CloseDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activityId:this.activity.id,
        activityType: this.activity.appType,
        action: action,
        engProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.activity.appType == 1,
        isESPcomponent:this.isESPcomponent,
        isMyspace:this.isMyspace
      },
    });
    dialogRef.afterClosed().subscribe((result) => {

        if(this.activeTab==ActiveTab.Details){
          if(!this.isESPcomponent){
            this._router.navigate([`pages/activities`]);
          }else{
            this._router.navigate([`pages/applications/${this.activity.requestId}`], {queryParams: { my: this.isMyspace?.toString(), activeTab:this.activeTab } });
          }
        }else{
          this.reload.emit(true);
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
        isEngProActivity: this.activity.appType == 1,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        // this.isLoadingEffort = true;

        let effort = result.data;//.form;
        this.activity.actualValue = effort.actualValue;
        this.activity.score = effort.actualValue;
        this.activity.progressStatus =
          effort.actualValue == null ? "Not Started" : "In progress";
        this.activity.progressStatusColor =
          effort.actualValue == null ? "#8795b1" : "#00a3ff";
        let newLog = {
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
          this.activity.effortInHour = Math.floor(
            moment.duration(this.activity.effortSum, "minutes").asHours()
          );

          this.activity.effortInMinute = Math.floor(
            moment
              .duration(
                moment.duration(this.activity.effortSum, "minutes").asHours() -
                  Math.floor(
                    moment
                      .duration(this.activity.effortSum, "minutes")
                      .asHours()
                  ),
                "hours"
              )
              .asMinutes()
          );
          // this.isLoadingEffort = false;
          return;
        } else {
          if (this.activity.effortSum == null || this.activity.effortSum == 0) {
            // this.displayedColumns.push("efforts");
          }
        }

        if (newLog.startTime != null && newLog.endTime != null) {
          let duration = moment.duration(
            moment(newLog.endTime, "hh:mm").diff(
              moment(newLog.startTime, "hh:mm")
            )
          );
          let minutes = Math.abs(duration.asMinutes());
          this.activity.effortSum += minutes;

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
            this.activity.effortSum += newLog.minutes;
          }

          if (newLog.hours != null) {
            this.activity.effortSum += moment
              .duration(newLog.hours, "hours")
              .asMinutes();
          }
        }

        this.activity.effortInHour = Math.floor(
          moment.duration(this.activity.effortSum, "minutes").asHours()
        );

        this.activity.effortInMinute = Math.floor(
          moment
            .duration(
              moment.duration(this.activity.effortSum, "minutes").asHours() -
                Math.floor(
                  moment.duration(this.activity.effortSum, "minutes").asHours()
                ),
              "hours"
            )
            .asMinutes()
        );

        this.activity.efforts.push(newLog);
        this.activity.efforts.reverse();

        // this.isLoadingEffort = false;
      }
    });
  }
  claimActivity(){
    this.isLoading=true;
    this._activitiesService
        .claim(
          this.activity.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
              if(this.activeTab==ActiveTab.Details){
                this._router.navigate([`pages/activities`]);
             }else{
               this.reload.emit(true);
             }
             this.isLoading = false;
            } else {
              this.isLoading=false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 300,
              });
            }
          }
        });
  }
  stopClaimActivity(){
    this.isLoading=true;
    this._activitiesService
        .stopClaiming(
          this.activity.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this._alertService.success(resp.ResponseMessage, {
                timeout: 300,
              });
              if(this.activeTab==ActiveTab.Details){
                this._router.navigate([`pages/activities/following/shared/details`]);
             }else{
               this.reload.emit(true);
             }
             this.isLoading=false;
            } else {
              this.isLoading=false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 300,
              });
            }
          }
        });
  }
  cancleClaimActivity(){
    this.isLoading=true;
    this._activitiesService
        .cancelClaimed(
          this.activity.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
            this._alertService.success(resp.ResponseMessage, {
              timeout: 300,
            });
            if(this.activeTab==ActiveTab.Details){
              this._router.navigate([`pages/activities/following/shared/details`]);
           }else{
             this.reload.emit(true);
           }

           this.isLoading=false;
            } else {
              this.isLoading=false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 300,
              });
            }
          }
        });
  }
  completeClaimActivity(){
    this.isLoading=true;
    this._activitiesService
        .completeClaimed(
          this.activity.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this._alertService.success(resp.ResponseMessage, {
                timeout: 300,
              });

              if(this.activeTab==ActiveTab.Details){
                this._router.navigate([`pages/activities/following/shared/details`]);
             }else{
               this.reload.emit(true);
             }
             this.isLoading=false;
            } else {
              this.isLoading=false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 300,
              });
            }
          }
        });
  }
  unplanActivity() {
    this.isLoading = true;
    let data = {
      id: this.activity.id,
      dueDate: null,
    };
    this._activitiesService
      .UpdateDueDate(data, this.engProLoggedInUserId, this.activity.appType == 1)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
            if(this.activeTab==ActiveTab.Details){
              if(!this.isESPcomponent){
                this._router.navigate([`pages/activities`]);
              }else{
                this._router.navigate([`pages/applications/${this.activity.requestId}`], {queryParams: { my: this.isMyspace?.toString(), activeTab:this.activeTab } });
              }
            }else{
              this.reload.emit(true);
            }
           this.isLoading = false;
          } else {
            this.isLoading = false;
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }
  cancelActivity() {
    this.isLoading = true;
    let data = {
      IndicatorId: this.activity.id,
      ActualValue: this.activity.actualValue,
      EffortInHour: this.activity.effortInHour,
      EffortInMinute: this.activity.effortInMinute,
      CommentText: this.activity.comment,
      Status: 4,
      CompletedDate: new Date(moment().format("LL")),
      StartTime: null,
      EndTime: null,
    };
    this._activitiesService
      .updateActualValue(data, this.engProLoggedInUserId, this.activity.appType == 1)
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
              if(this.activeTab==ActiveTab.Details){
                if(!this.isESPcomponent){
                  this._router.navigate([`pages/activities`]);
                }else{
                  this._router.navigate([`pages/applications/${this.activity.requestId}`], {queryParams: { my: this.isMyspace?.toString() , activeTab:this.activeTab} });
                }
              }else{
                this.reload.emit(true);
              }
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {}
      );
  }
  reopenActivity() {
    this.isLoading = true;
    this.dataLoaded = false;
    let data = {
      IndicatorId: this.activity.id,
      ActualValue: null,
      Status: 1,
    };
    this._activitiesService
      .updateActualValue(data, this.engProLoggedInUserId, this.activity.appType == 1)
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.reload.emit(true);
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this.isLoading = false;
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {}
      );
  }
  deleteActivity() {
    const dialogRef = this._dialog.open(ConfirmDeleteDialog, {
      width: "335px",
      data: {
        activity: this.activity,
        engProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.activity.appType == 1,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
     if(this.activeTab==ActiveTab.Details){
      if(!this.isESPcomponent){
        //this._router.navigate([`pages/activities`]);
        this._location.back();
      }else{
        this._router.navigate([`pages/applications/${this.activity.requestId}`], {queryParams: { my: this.isMyspace?.toString(), activeTab:this.activeTab } });
      }

    }else{
      this.reload.emit(true);
    }
    });
  }
  openActivityDialog(formMode: string,  action?: number): void {

    if(this.oppProData !=undefined && this.oppProData !=null ){
      this._activitiesService?.getUserInfoForStemexe(this.oppProData)?.subscribe((resp:any) => {
        if (!!resp) {
          if (this.activity.oppProActivityType == null || (this.activity.appType == 2 && this.activity.oppProActivityType.toLowerCase() =='task' ) ) {
            const dialogRef = this._dialog.open(ActivityDialog, {
              width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
              // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
              maxWidth:
                this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
              maxHeight:
                this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
              data: {
                isMine:   this.activeTab == 'Backlog' || this.activeTab == 'Details' && this.activity.dueDate == null  ? null : (this.activity.appType !=1 && this.activity.owner_UserId == this.loggedInUserId ||this.activity.appType ==1 && this.activity.owner_UserId == this.engProLoggedInUserId ) &&  (this.activeTab == 'Mine' || this.activeTab == 'Details' )? true : false,
                formMode: formMode,
                activityId: this.activity.id,
                activityType:  this.activity.appType,
                engProData: {
                  isEngProEnabled: this.activity.appType == 1 ? true : false,
                  engProLoggedInUserId: this.activity.appType == 1? this.activity.owner_UserId : null,
                },
                oppProData: {
                  isOppProEnabled:  true,
                  user: resp.result,
                  accessToken: this.oppProData.access_token,
                  access_token: this.oppProData.access_token,
                },
                action: action,
                espAddon:this.espAddon,
                isEspEnabled:!!this.espAddon  && this.espAddon!=null ? true:false,
                requestId:this.activity.requestId,
                isEpmActivity:this.activity.appType == 3,
                parentProjectId:!!this.activity.epmInfo ? this.activity.epmInfo.ParentProjectId:null,
                taskId:!!this.activity.epmInfo ? this.activity.epmInfo.TaskId:null,
              },
            });

            dialogRef.afterClosed().subscribe((result) => {
              this.reload.emit(true);
            });
          }
          //  else {
          //   const dialogRef = this._dialog.open(OppProDialog, {
          //     width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
          //     //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
          //     maxWidth:
          //       this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
          //     maxHeight:
          //       this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
          //     data: {
          //       formType: this.activity.oppProActivityType.toLowerCase(),
          //       formMode: formMode,
          //       activityId: this.activity.id,
          //       oppProData: {
          //         isOppProEnabled: true,
          //         user: resp.result,
          //         accessToken: this.oppProData.access_token,
          //         access_token: this.oppProData.access_token,
          //       },

          //     },
          //   });
          //   dialogRef.afterClosed().subscribe((result) => {
          //     this.reload.emit(true);
          //   });
          // }
        }
      });

    }else{


        const dialogRef = this._dialog.open(ActivityDialog, {
          width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
          // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
          maxWidth:
            this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
          maxHeight:
            this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
          data: {
            isMine:   this.activeTab == 'Backlog' || this.activeTab == 'Details' && this.activity.dueDate == null  ? null : (this.activity.appType !=1 && this.activity.owner_UserId == this.loggedInUserId ||this.activity.appType ==1 && this.activity.owner_UserId == this.engProLoggedInUserId ) &&  (this.activeTab == 'Mine' || this.activeTab == 'Details' )? true : false,
            formMode: formMode,
            activityId: this.activity.id,
            activityType:  this.activity.appType,
            engProData: {
              isEngProEnabled: this.activity.appType == 1,
              engProLoggedInUserId: this.engProLoggedInUserId,

            },
            action: action,
            espAddon:this.espAddon,
            isEspEnabled:!!this.espAddon  && this.espAddon!=null ? true:false,
            isESPcomponent:this.isESPcomponent,
            requestId:this.activity.requestId,
            isEpmActivity:this.activity.appType == 3,
            parentProjectId:!!this.activity.epmInfo ? this.activity.epmInfo.ParentProjectId:null,
            taskId:!!this.activity.epmInfo ? this.activity.epmInfo.TaskId:null,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {

          this.reload.emit(true);
        });

    }
  }
  doAcceptAction() {
    if (
      !this.activity.isAccepted &&
      ((this.activity.owner_UserId == this.engProLoggedInUserId &&
        this.activity.appType == 1) ||
        (this.activity.owner_UserId == this.loggedInUserId &&
          this.activity.appType != 1))
    ) {
      this.acceptAssigned(this.activity);
    } else {
      this.approveReported(this.activity);
    }
  }
  doRejectAction() {
    this.openRejectDialog();
  }
  acceptAssigned(item:any) {
    this.isLoading = true;
    this.dataLoaded = false;
    this._activitiesService
      .acceptAssigned(item.id, this.engProLoggedInUserId, this.activity.appType == 1)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.reload.emit(true);
            this._alertService.success(
              "You accepted the “" +
                item.description +
                "” activity.Now you can find it under the “Mine” tab.",
              {
                timeout: 3000,
              }
            );
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }
  approveReported(item:any) {
    this.isLoading = true;

    this.dataLoaded = false;
    this._activitiesService
      .approveReported(
        item.id,
        this.engProLoggedInUserId,
        this.activity.appType == 1
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.reload.emit(true);
            this._alertService.success(
              "You approved the “" +
                item.description +
                "” activity.Now you can find it under the “Following” tab.",
              {
                timeout: 3000,
              }
            );
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }
  openRejectDialog(): void {
    const dialogRef = this._dialog.open(RejectDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: {
        activity: this.activity,
        type:
          (this.activity.owner_UserId== this.engProLoggedInUserId &&
            this.activity.appType == 1) ||
          (this.activity.owner_UserId== this.loggedInUserId &&
            this.activity.appType != 1)
            ? "assigned"
            : "reported",

        engProLoggedInUserId: this.engProLoggedInUserId,
        isEngProActivity: this.activity.appType == 1,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(this.activeTab == ActiveTab.Details){
        this._location.back();
       }else{
        this.reload.emit(true);
       }
    });
  }
  openShareWithUsersDialog(){
    // const dialogRef = this._dialog.open(ShareWithUsersDialogComponent, {
    //   width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
    //   // height: this.size == "XS" || this.size == "SM" ? "100%" : "620px",
    //   panelClass:
    //   this.size == "XS" || this.size == "SM"
    //     ? "small-dialog"
    //     : "large-dialog",
    //   maxWidth:
    //     this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
    //   maxHeight:
    //     this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
    //   data: {
    //     activityId:this.activity.id,
    //     activityAppType:this.activity.appType,
    //     engagementProLoggedInUserId:this.engProLoggedInUserId,
    //     isEngProActivity:this.activity.appType == 1
    //   },
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   this.reload.emit(true);
    // });


  }

}
