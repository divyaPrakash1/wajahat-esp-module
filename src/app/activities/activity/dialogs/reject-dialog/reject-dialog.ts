import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Activity } from "../../models/activity";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { ConfirmRejectDialog } from "../confirm-reject-dialog/confirm-reject-dialog";

@Component({
  selector: "xcdrs-reject-dialog",
  templateUrl: "./reject-dialog.html",
  styleUrls: ["./reject-dialog.scss"],
})
export class RejectDialog implements OnInit {
  size: string;
  form: FormGroup;
  activity: Activity;
  isLoading: boolean = false;
  isArabic:boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<RejectDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: Activity;
      type: string;
      engProLoggedInUserId: string;
      isEngProActivity;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x: any) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    this.form = this._fb.group({
      rejectReason: new FormControl(null),
    });
  }

  getLanguage(): void {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  onNoClick(): void {
    this.cancel();
  }

  cancel(): void {
    this._dialogRef.close();
  }

  submit(): void {
    this.isLoading = true;
    if (this.data.type == "assigned") {
      this.rejectAssigned();
    } else {
      this.rejectReported();
    }
  }

  rejectReported(): void {
    this._activitiesService
      .rejectReported(
        this.data.activity.id,
        this.form.value.rejectReason,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe((resp: any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.cancel();
            this.isLoading = false;
            this._alertService.success( !this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      }),
      (error: Error): void => {};
  }
  rejectAssigned(): void {
    this._activitiesService
      .rejectAssigned(
        this.data.activity.id,
        this.form.value.rejectReason,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe(
        (resp: any) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.cancel();
              this.isLoading = false;
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
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
