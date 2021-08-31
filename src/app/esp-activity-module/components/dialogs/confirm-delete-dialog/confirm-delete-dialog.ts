import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AlertService } from "../../../../esp-activity-module/alert/alert.service";
import { Actions } from "../../../../esp-activity-module/enums/enums";
import { Activity } from "../../../../esp-activity-module/models/activity";
import { ActivitiesService } from "../../../../esp-activity-module/services/activities.service";
// import { AlertService } from "src/app/esp-activity-module/alert/alert.service";
// import { Actions } from "src/app/esp-activity-module/enums/enums";
// import { Activity } from "src/app/esp-activity-module/models/activity";
// import { ActivitiesService } from "src/app/esp-activity-module/services/activities.service";

@Component({
  selector: "xcdrs-confirm-delete-dialog",
  templateUrl: "./confirm-delete-dialog.html",
  styleUrls: ["./confirm-delete-dialog.scss"],
})
export class ConfirmDeleteDialog implements OnInit {
  isLoading: boolean = false;
  constructor(
    private _activitiesService: ActivitiesService,
    private _router: Router,
    private _alertService: AlertService,
    public _dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: Activity;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
    }
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
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
            this.cancel();
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.isLoading = false;
          } else {
            this.cancel();
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
            this.isLoading = false;
          }
        }
      });
  }
}
