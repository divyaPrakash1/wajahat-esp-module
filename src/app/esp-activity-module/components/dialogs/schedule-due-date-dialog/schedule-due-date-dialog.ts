import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FormBuilder, FormGroup } from "@angular/forms";
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
import * as moment from "moment";
import { delay } from "rxjs/operators";
// import { AlertService } from "src/app/esp-activity-module/alert/alert.service";
// import { SCREEN_SIZE } from "src/app/esp-activity-module/enums/shared.enums";
// import { Activity } from "src/app/esp-activity-module/models/activity";
// import { ActivitiesService } from "src/app/esp-activity-module/services/activities.service";
// import { ResizeService } from "src/app/esp-activity-module/services/resize.service";
import { RejectDialog } from "../reject-dialog/reject-dialog";

@Component({
  selector: "xcdrs-schedule-due-date-dialog",
  templateUrl: "./schedule-due-date-dialog.html",
  styleUrls: ["./schedule-due-date-dialog.scss"],
})
export class ScheduleDueDateDialog implements OnInit {
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
      engProLoggedInUserId: any;
      isEngProActivity: boolean;
      isBacklog:boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      dueDate: new FormControl(this.data.isBacklog ? null : new Date(this.data.activity.DueDate)),
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
    let data = {
      id: this.data.activity.id,
      dueDate: moment(new Date(this.form.get("dueDate")?.value)).format("LL"),
    };
    this._activitiesService
      .UpdateDueDate(
        data,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            this.isLoading = false;
            this.cancel();
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
          } else {
            this.isLoading = false;
            this.cancel();
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }
}
