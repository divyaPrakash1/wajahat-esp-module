import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import * as moment from "moment";
import { delay } from "rxjs/operators";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { Activity } from "../../models/activity";
import { ActivitiesService } from "../../services/activities.service";
import { RejectDialog } from "../reject-dialog/reject-dialog";

@Component({
  selector: "xcdrs-schedule-due-date-dialog",
  templateUrl: "./schedule-due-date-dialog.html",
  styleUrls: ["./schedule-due-date-dialog.scss"],
})
export class ScheduleDueDateDialog implements OnInit {
  size: string;
  form: FormGroup;
  activity: Activity;
  isLoading: boolean = false;
  isArabic: boolean = false;
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
      engProLoggedInUserId: any;
      isEngProActivity: boolean;
      isBacklog:boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x: any) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      dueDate: new FormControl(this.data.isBacklog ? null : new Date(this.data.activity.DueDate)),
    });
  }

  onNoClick(): void {
    this.getLanguage()
    this.cancel();
  }

  getLanguage(): void {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  cancel(): void {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    let data = {
      id: this.data.activity.id,
      dueDate: moment(new Date(this.form.get("dueDate").value)).format("LL"),
    };
    this._activitiesService
      .UpdateDueDate(
        data,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe((resp: any) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.isLoading = false;
            this.cancel();
            this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
          } else {
            this.isLoading = false;
            this.cancel();
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }
}
