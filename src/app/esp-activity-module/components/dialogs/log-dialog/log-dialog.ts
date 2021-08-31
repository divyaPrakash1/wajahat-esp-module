import { Component, Inject } from '@angular/core';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { delay } from 'rxjs/operators';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../../../esp-activity-module/services/activities.service';
import { AlertService } from '../../../../esp-activity-module/alert/alert.service';
import { ResizeService } from '../../../../esp-activity-module/services/resize.service';
import { Activity } from '../../../../esp-activity-module/models/activity';
import { SCREEN_SIZE } from '../../../../esp-activity-module/enums/shared.enums';
// import { ActivitiesService } from 'src/app/esp-activity-module/services/activities.service';
// import { AlertService } from 'src/app/esp-activity-module/alert/alert.service';
// import { ResizeService } from 'src/app/esp-activity-module/services/resize.service';
// import { SCREEN_SIZE } from 'src/app/esp-activity-module/enums/shared.enums';
// import { Activity } from 'src/app/esp-activity-module/models/activity';
// import { AlertService } from "app/esp-activity-module/alert/alert.service";
// import { Activity } from "app/esp-activity-module/models/activity";
// import { ActivitiesService } from "app/esp-activity-module/services/activities.service";
// import { ResizeService } from "app/esp-activity-module/services/resize.service";
// import { SCREEN_SIZE } from "app/esp-activity-module/enums/shared.enums";
@Component({
  selector: "xcdrs-log-dialog",
  templateUrl: './log-dialog.html',
  styleUrls: ['./log-dialog.scss'],
})
export class LogDialog {
  size!: string;
  form!: FormGroup;
  loggedActuals!: number;
  target!: number;
  isLoading: boolean = false;
  dataloaded: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    private _resizeService: ResizeService,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<LogDialog>,
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
  }

  ngOnInit(): void {
    this.loggedActuals = this.data.activity.actualValue;
    this.target = this.data.activity.targetValue;

    this.form = this._fb.group({
      id: new FormControl(this.data.isForNew ? '' : this.data.activity.id),
      description: new FormControl(
        this.data.isForNew ? '' : this.data.activity.description
      ),
      status: new FormControl(this.data.activity.status),
      actualValue: new FormControl(this.data.activity.actualValue),
      logDate: new FormControl(
        this.data.activity.completedDate == null
          ? new Date(moment().format('LL'))
          : new Date(moment(this.data.activity.completedDate).format('LL')),
        [Validators.required]
      ),
      startTime: new FormControl(''),
      endTime: new FormControl(''),
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
        !this.data.isForNew ? '' : this.data.activity.comment
      ),
    });

    this.dataloaded=true;
    this.onChanges();
  }
  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    if (this.data.isForNew == true) {
      //this._dialogRef.close(this.form.value);
      this.isLoading = false;
    } else {
      let data = {
        IndicatorId: this.form.get('id')?.value,
        EffortInHour: this.form.get('effortInHour')?.value,
        ActualValue: this.form.get('actualValue')?.value,
        EffortInMinute: this.form.get('effortInMinute')?.value,
        CommentText: this.form.get('comment')?.value,
        Status: null,
        CompletedDate: moment(this.form.get('logDate')?.value).format('LL'),
        StartTime: this.form.get('startTime')?.value,
        EndTime: this.form.get('endTime')?.value,
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
                this.form.get('comment')?.setValue(null);
                this.data.activity.logComment = undefined;
                //this._dialogRef.close({ data: this.form.value });
                this.isLoading = false;
              } else {
                this._dialogRef.close();
                this.isLoading = false;
                this._alertService.error(resp.ResponseMessage, {
                  timeout: 3000,
                });
              }
            }
          },
          (error: Error): void => {}
        );
    }
  }

  onChanges(): void {
    this.form.get('effortInHour')?.valueChanges.subscribe((val) => {
      if (val != '' && val != null) {
        this.form.get('startTime')?.setValue(null);
        this.form.get('endTime')?.setValue(null);
      }
    });

    this.form.get('effortInMinute')?.valueChanges.subscribe((val) => {
      if (val != '' && val != null) {
        this.form.get('startTime')?.setValue(null);
        this.form.get('endTime')?.setValue(null);
      }
    });

    this.form.get('startTime')?.valueChanges.subscribe((val) => {
      if (val != '' && val != null) {
        this.form.get('effortInHour')?.setValue(null);
        this.form.get('effortInMinute')?.setValue(null);
      }
    });

    this.form.get('endTime')?.valueChanges.subscribe((val) => {
      if (val != '' && val != null) {
        this.form.get('effortInHour')?.setValue(null);
        this.form.get('effortInMinute')?.setValue(null);
        this.isValidEndDate();
      }
    });
  }

  isValidEndDate() {
    let isValid =
      this.form.get('endTime')?.value != null &&
      moment(this.form.get('startTime')?.value, 'hh:mm a').isBefore(
        moment(this.form.get('endTime')?.value, 'hh:mm a')
      );

    return !isValid
      ? this.form.get('endTime')?.setErrors({ incorrect: true })
      : null;
  }
}
