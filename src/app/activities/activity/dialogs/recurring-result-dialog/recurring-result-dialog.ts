import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { delay } from 'rxjs/operators';
import { ActivityAlertService } from '../../../shared/alert/alert-activity.service';
import { ActivityResizeService } from '../../../shared/services/resize-activity.service';
import { SCREEN_SIZE } from '../../../shared/shared-activity.enums';
import { ActivitiesService } from '../../services/activities.service';

@Component({
  selector: 'xcdrs-recurring-result-dialog',
  templateUrl: './recurring-result-dialog.html',
  styleUrls: ['./recurring-result-dialog.scss']
})
export class RecurringResultDialog implements OnInit {
  size: string;  
  isLoading: boolean = false;
  weekDays:string[]=[
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
   "Thursday",
    "Friday",
   "Saturday"
];
distributionOptions: string[] = [
  "Even",
  "Fixed Value", 
 "Accumulative", 
];
daysString:string="";
noOfDayOpts:string[] = ["after start of the month","before end of the month"];

constructor(
  private _alertService: ActivityAlertService,
  private _activitiesService: ActivitiesService,
  public _dialog: MatDialog,
  private _resizeService: ActivityResizeService,
  public _dialogRef: MatDialogRef<RecurringResultDialog>,
  @Inject(MAT_DIALOG_DATA)
  public data: {
    results:any[],
    numberOfTimes:number,
    freqtTimesType:string
    selectedDayIds:any[],
    repeatEndsDate:string,
    distribution:number,
    targetValue:number,
    repeatEndsAfterTimes:number,
    selectedSeqNoOfDay:number,
    selectedNoOfDayOpt:number,
    frequancyOption:any,
    selectedNoOfDay:number,
  }
) {
  this._resizeService.onResize$.pipe(delay(0)).subscribe((x: any) => {
    this.size = SCREEN_SIZE[x];
  });
}


  ngOnInit(): void {
    this.getOnDaysStr();
  }
  getOnDaysStr(): void {
    let selectedDays=[];
    for (var i = 0; i < this.data.selectedDayIds.length; i++) {
      for (var j = 0; j < this.weekDays.length; j++) {
        if (this.data.selectedDayIds[i] == j) {
          selectedDays.push(this.weekDays[j]);
        }
      }
    }
    this.daysString = [selectedDays.slice(0, -1).join(', '), selectedDays.slice(-1)[0]].join(selectedDays.length < 2 ? '' : ' and ')
  
  }
  onNoClick(): void {
    this.cancel();
  }

  
  cancel(): void {
    this._dialogRef.close();
  }

  submit(): void {
  this._dialogRef.close(
                `Every ${this.data.numberOfTimes} ${this.data.freqtTimesType}`
              );
  }


}
