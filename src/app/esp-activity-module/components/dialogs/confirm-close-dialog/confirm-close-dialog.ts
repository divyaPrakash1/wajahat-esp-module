import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AlertService } from "../../../../esp-activity-module/alert/alert.service";
import { SCREEN_SIZE } from "../../../../esp-activity-module/enums/shared.enums";
import { ActivitiesService } from "../../../../esp-activity-module/services/activities.service";
import { ResizeService } from "../../../../esp-activity-module/services/resize.service";
import { delay } from "rxjs/operators";
// import { AlertService } from "src/app/esp-activity-module/alert/alert.service";
// import { SCREEN_SIZE } from "src/app/esp-activity-module/enums/shared.enums";
// import { ActivitiesService } from "src/app/esp-activity-module/services/activities.service";
// import { ResizeService } from "src/app/esp-activity-module/services/resize.service";
@Component({
  selector: "xcdrs-confirm-close-dialog",
  templateUrl: "./confirm-close-dialog.html",
  styleUrls: ["./confirm-close-dialog.scss"],
})
export class ConfirmCloseDialog implements OnInit {
  closeAs: string = '';
  isLoading: boolean = false;
  size: any;
  constructor(
    private _router: Router,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    private _resizeService: ResizeService,
    public _dialogRef: MatDialogRef<ConfirmCloseDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      form: any;
      submitData: any;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.data.form.closeAs == 0
      ? (this.closeAs = "Done")
      : (this.closeAs = "Cancelled");
  }

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    this._activitiesService
      .updateActualValue(
        this.data.submitData,
        this.data.engProLoggedInUserId,
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
              this._router.navigate([`pages/activities`]);
            } else {
              this._dialogRef.close();
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });

              this.isLoading = false;
            }
          }
        },
        (error: Error): void => {}
      );
  }

  cancel() {
    this._dialogRef.close();
  }
}
