import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { delay } from "rxjs/operators";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { Activity } from "../../models/activity";
import { ActivitiesService } from "../../services/activities.service";
import { ConfirmRejectDialog } from "../confirm-reject-dialog/confirm-reject-dialog";
import { RejectDialog } from "../reject-dialog/reject-dialog";

@Component({
  selector: "xcdrs-reject-multiple-dialog",
  templateUrl: "./reject-multiple-dialog.component.html",
  styleUrls: ["./reject-multiple-dialog.component.scss"],
})
export class RejectMultipleDialogComponent implements OnInit {
  activities: any = [];
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
    this.activities = this.data.activity;
  }

  getLanguage(): void {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  cancel(): void {
    this._dialogRef.close();
  }

  submit(): void {
    let ids: any = [];
    this.activities.map((obj: any) => {
      ids.push(obj.id);
    });
    this.isLoading = true;
    this._activitiesService.rejectMultiple(ids).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.cancel();
            this.isLoading = false;
            this._alertService.success(
              !this.isArabic ? "Selected activities have been successfully rejected" : "تم رفض الأنشطة المحددة بنجاح",
              {
                timeout: 3000,
              }
            );
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
  onNoClick(): void {
    this.cancel();
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
