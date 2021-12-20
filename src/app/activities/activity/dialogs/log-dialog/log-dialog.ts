import { Component, Inject } from "@angular/core";

import { Activity } from "../../models/activity";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { CloseDialog } from "../close-dialog/close-dialog";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import * as moment from "moment";
import { ConfirmLogDialog } from "../confirm-log-dialog/confirm-log-dialog";
import { Router } from "@angular/router";
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: "xcdrs-log-dialog",
  templateUrl: "./log-dialog.html",
  styleUrls: ["./log-dialog.scss"],
})
export class LogDialog {
  size: string;
  form: FormGroup;
  loggedActuals: number;
  target: number;
  isLoading: boolean = false;
  dataloaded: boolean = false;
  isArabic: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _resizeService: ActivityResizeService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<CloseDialog>,
    private dateTimeAdapter: DateTimeAdapter<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: Activity;
      isForNew: boolean;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
    
    // this.dateTimeAdapter.setLocale('ar');
  }

  ngOnInit(): void {
    // this.dateTimeAdapter.setLocale('ar');
    this.getLanguage();
    // moment.lang("en");
    this.loggedActuals = this.data.activity.actualValue;
    this.target = this.data.activity.targetValue;

    this.form = this._fb.group({
      id: new FormControl(this.data.isForNew ? "" : this.data.activity.id),
      description: new FormControl(
        this.data.isForNew ? "" : this.data.activity.description
      ),
      status: new FormControl(this.data.activity.status),
      actualValue: new FormControl(this.data.activity.actualValue),
      logDate: new FormControl(
        this.data.activity.completedDate == null
          ? new Date(moment().format("LL"))
          : new Date(moment(this.data.activity.completedDate).format("LL")),
        [Validators.required]
      ),
      startTime: new FormControl(""),
      endTime: new FormControl(""),
      effortInHour: new FormControl(
        // this.data.activity.effortInHour == 0
        //   ? null
        //   : this.data.activity.effortInHour,
        null,
        [Validators.max(200)]
      ),
      effortInMinute: new FormControl(
        null,
        // this.data.activity.effortInMinute == 0
        //   ? null
        //   : this.data.activity.effortInMinute,
        [Validators.max(59)]
      ),
      comment: new FormControl(
        !this.data.isForNew ? "" : this.data.activity.comment
      ),
    });
    // moment.lang("ar");
    this.dataloaded=true;
    this.onChanges();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }
  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    // moment.lang("en");
    this.isLoading = true;
    if (this.data.isForNew == true) {
      this._dialogRef.close(this.form.value);
      this.isLoading = false;
    } else {
      let data = {
        IndicatorId: this.form.get("id").value,
        EffortInHour: this.form.get("effortInHour").value,
        ActualValue: this.form.get("actualValue").value,
        EffortInMinute: this.form.get("effortInMinute").value,
        CommentText: this.form.get("comment").value,
        Status: null,
        CompletedDate: moment(this.form.get("logDate").value).format("LL"),
        StartTime: this.form.get("startTime").value,
        EndTime: this.form.get("endTime").value,
      };
      this._activitiesService
        .updateActualValue(
          data,
          this.data.engProLoggedInUserId,
          this.data.isEngProActivity
        )
        .subscribe(
          (resp) => {
            if (!!resp) {
              if (resp.ResponseCode == 2000) {
                // moment.lang("ar");
                this.form.get("comment").setValue(null);
                this.data.activity.logComment = null;
                this._dialogRef.close({ data: this.form.value });
                this.isLoading = false;
                this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                  timeout: 3000,
                });
              } else {
                this._dialogRef.close();
                this.isLoading = false;
                this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                  timeout: 3000,
                });
              }
            }
          },
          (error: Error): void => {}
        );
    }
  }

  openConfirmLogDialog(): void {
    const dialogRef = this._dialog.open(ConfirmLogDialog, {
      width: "300px",
      data: { form: this.form.value },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this._dialogRef.close(result);
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
