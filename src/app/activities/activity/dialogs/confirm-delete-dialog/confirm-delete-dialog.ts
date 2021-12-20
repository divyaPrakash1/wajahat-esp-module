import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { Actions } from "../../enums";
import { Activity } from "../../models/activity";
import { Router } from "@angular/router";

@Component({
  selector: "xcdrs-confirm-delete-dialog",
  templateUrl: "./confirm-delete-dialog.html",
  styleUrls: ["./confirm-delete-dialog.scss"],
})
export class ConfirmDeleteDialog implements OnInit {
  isLoading: boolean = false;
  isArabic: boolean = false;
  constructor(
    private _activitiesService: ActivitiesService,
    private _router: Router,
    private _alertService: ActivityAlertService,
    public _dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: Activity;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
    }
  ) {}

  ngOnInit(): void {
    this.getLanguage();
  }

  onNoClick(): void {
    this.cancel();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  cancel(data = false) {
    this._dialogRef.close(data);
  }

  submit() {
  
    this.isLoading = true;
    this._activitiesService
      .delete(
        this.data.activity.id.toString(),
        Actions.delete,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.cancel(true);
            this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
            this.isLoading = false; 
          } else {
            this.cancel();
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
            this.isLoading = false;
          }
        }
      });
  }
}
