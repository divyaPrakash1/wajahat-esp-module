import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { AlertService } from "../../../../esp-activity-module/alert/alert.service";
import { SCREEN_SIZE } from "../../../../esp-activity-module/enums/shared.enums";
import { Activity } from "../../../../esp-activity-module/models/activity";
import { ActivitiesService } from "../../../../esp-activity-module/services/activities.service";
import { ResizeService } from "../../../../esp-activity-module/services/resize.service";
import { delay } from "rxjs/operators";
// import { AlertService } from "src/app/esp-activity-module/alert/alert.service";
// import { SCREEN_SIZE } from "src/app/esp-activity-module/enums/shared.enums";
// import { Activity } from "src/app/esp-activity-module/models/activity";
// import { ActivitiesService } from "src/app/esp-activity-module/services/activities.service";
// import { ResizeService } from "src/app/esp-activity-module/services/resize.service";
import { ConfirmRejectDialog } from "../confirm-reject-dialog/confirm-reject-dialog";

@Component({
  selector: "xcdrs-reject-dialog",
  templateUrl: "./reject-dialog.html",
  styleUrls: ["./reject-dialog.scss"],
})
export class RejectDialog implements OnInit {
  size!: string;
  form!: FormGroup;
  activity!: Activity;
  isLoading: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<RejectDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: Activity;
      type: string;
      engProLoggedInUserId: string;
      isEngProActivity:any;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      rejectReason: new FormControl(null),
    });
  }

  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    if (this.data.type == "assigned") {
      this.rejectAssigned();
    } else {
      this.rejectReported();
    }
  }

  rejectReported() {
    this._activitiesService
      .rejectReported(
        this.data.activity.id,
        this.form.value.rejectReason,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.cancel();
            this.isLoading = false;
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      }),
      (error: Error): void => {};
  }
  rejectAssigned() {
    this._activitiesService
      .rejectAssigned(
        this.data.activity.id,
        this.form.value.rejectReason,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.cancel();
              this.isLoading = false;
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {}
      );
  }

  openConfirmRejectDialog(): void {
    this.activity = this.data.activity;
    const dialogRef = this._dialog.open(ConfirmRejectDialog, {
      width: "300px",
      data: { form: this.activity },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.cancel();
    });
  }
}
