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
import { SignedDialogComponent } from "../signed-dialog/signed-dialog.component";

@Component({
  selector: "xcdrs-revoke-dialog",
  templateUrl: "./revoke-dialog.component.html",
  styleUrls: ["./revoke-dialog.component.scss"],
})
export class RevokeDialogComponent implements OnInit {
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
    public _dialogRef: MatDialogRef<SignedDialogComponent>,
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
    console.log("data", this.data);
    this.activities = this.data.activity;
    // this.form = this._fb.group({
    //   rejectReason: new FormControl(null),
    // });
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
    this.signedActivity();
  }

  signedActivity(): void {
    let ids: any = [];
    this.activities.map((obj: any) => {
      ids.push(obj.id);
    });
    // console.log("idssdsdsdsdsd", ids);
    this._activitiesService.revokeMultiple(ids).subscribe((resp: any) => {
      if (!!resp) {
        if (resp.ResponseCode === 2000) {
          this.cancel();
          this.isLoading = false;
          this._alertService.success(
            !this.isArabic ? "Selected activities have been revoked successfully" : "تم إبطال الأنشطة المحددة بنجاح",
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
    }),
      (error: Error): void => {};
  }
}
