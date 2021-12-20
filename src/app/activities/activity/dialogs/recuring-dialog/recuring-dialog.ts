import { Component, Inject, OnInit } from "@angular/core";
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
import { ActivitiesService } from "../../services/activities.service";
import { RecurringResultDialog } from '../recurring-result-dialog/recurring-result-dialog';

@Component({
  selector: "xcdrs-recuring-dialog",
  templateUrl: "./recuring-dialog.html",
  styleUrls: ["./recuring-dialog.scss"],
})
export class RecuringDialog implements OnInit {
  size: string;
  target: number;
  isLoading: boolean = false;
  repeat: boolean = true;
  numberOfTimes: number = null;
  isWeeks: boolean = true;
  freqtTimesType: string = "weeks";
  frequancyOptions: { id: number; name: string; active: boolean }[] = [
    { id: 0, name: "weeks", active: true },
    { id: 1, name: "months", active: false },
  ];
  days1: { id: number; name: string; checked: boolean }[] = [
    { id: 0, name: "Sunday", checked: false },
    { id: 1, name: "Monday", checked: false },
    { id: 2, name: "Tuesday", checked: false },
    { id: 3, name: "Wednesday", checked: false },
  ];
  days2: { id: number; name: string; checked: boolean }[] = [
    { id: 4, name: "Thursday", checked: false },
    { id: 5, name: "Friday", checked: false },
    { id: 6, name: "Saturday", checked: false },
  ];

  repeatEndsOnDate: string = '';
  repeatEndsOnDateStr: string = '';

  repeatEndsAfterTimes: number = null;

  repeatEndsOptions: { id: number; name: string; active: boolean }[] = [
    { id: 0, name: "On", active: true },
    { id: 1, name: "After number of times", active: false },
  ];
  distributionOptions: { id: number; name: string; active: boolean }[] = [
    { id: 0, name: "Even", active: false },
    { id: 1, name: "Fixed Value", active: true },
    { id: 2, name: "Accumulative", active: false },
  ];
  selectedDistribution: number = 1;
  shortDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  selectedshortDays: string[] = [];
  selectedshortDaysStr: string;
  selectedshortDayIds: number[] = [];
  
  startDate:any;
  startDay:string;
  noOfDay: number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
  selectedNoOfDay:number =null;
  noOfDayOpts:{id:number; name:string}[] = [{id:0, name:"after start of the month"},{id:1, name:"before end of the month"}];
  selectedNoOfDayOpt:number =null;
  sequenceNumber : number[]=[1, 2, 3, 4, 5];
  selectedSeqNoOfDay:number=null;
  weekDays:{id:number; name:string}[]=[
    {id:0,name:"Sunday"},
    {id:1,name:"Monday"},
    {id:2,name:"Tuesday"},
    {id:3,name:"Wednesday"},
    {id:4,name:"Thursday"},
    {id:5,name:"Friday"},
    {id:6,name:"Saturday"}
];
monthFreqOptions: { id: number; name: string; active: boolean }[] = [
  { id: 0, name: "On", active: true },
  { id: 1, name: "On", active: false },
];
 isMonthFreqFirstOption:boolean=false;

startDayNo:number=null;
isArabic: boolean = false;
//"1(st)", "2(nd)", "3(rd)", "4(th)", "last day"
  constructor(
    private _alertService: ActivityAlertService,
    private _activitiesService: ActivitiesService,
    public _dialog: MatDialog,
    private _resizeService: ActivityResizeService,
    public _dialogRef: MatDialogRef<RecuringDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      activity: any;
      isMine: boolean;
      files: any;
      selectedJob: any;
      selectedProject: any;
      selectedCondition: any;
      selectedApp: any;
      important: boolean;
      follow: boolean;
      loggedInUserId: any;
      assignedTo: any;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
      requestId:any,
      requestNumber:any,
      requestName:any,
      isShared:any,
      maxClaims:any,
      shareWithIds:any
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x: any) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    this.startDate =new Date();//moment(new Date()).format("DD MMM YYYY");
    this.startDay = moment(new Date()).format("dddd");
    this.startDayNo = parseInt(moment(new Date()).format("D"));
    this.selectedNoOfDay = this.startDayNo;
    this.selectedNoOfDayOpt=this.noOfDayOpts[0].id;
    this.selectedSeqNoOfDay=this.sequenceNumber[0];
    this.selectedNoOfDayOpt = this.weekDays[0].id;
    this.setDayOfWeek();
  }

  getLanguage(): void {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  setDayOfWeek(): void {
    this.days1.forEach((day: any) => {
     day.name == this.startDay?day.checked=true:day.checked=false;
    });
    this.days2.forEach((day: any) => {
      day.name == this.startDay?day.checked=true:day.checked=false;
    });
    let day = this.days1.filter((day: any)=>day.checked).length > 0 ? this.days1.filter((day: any)=>day.checked): this.days2.filter((day: any)=>day.checked);
    this.updateFrequncyDay(day[0]);
  }

  onNoClick(): void {
    this.cancel();
  }

  isNoDaysSelected(){
     return this.days1.filter((val) => val.checked == true).length == 0 && this.days2.filter((val) => val.checked == true).length == 0 ;
  }

  updateDistribution(dist) {
    dist.active = true;
    this.distributionOptions.forEach((opt) => {
      opt.id != dist.id ? (opt.active = false) : "";
    });
    this.selectedDistribution = dist.id;
  }

  onChangeEvent(ev) {
    this.repeatEndsOnDateStr = moment(ev).format("DD MMMM YYYY");
  }

  activateFrequancyType(type: { id: number; name: string; active: boolean }) {
    switch (type.name) {
      case "months":
        this.isWeeks = false;
        this.frequancyOptions[0].active = false;
        this.isMonthFreqFirstOption = true;
        break;
      default:
        this.isWeeks = true;
        this.frequancyOptions[1].active = false;
        this.isMonthFreqFirstOption = false;
        break;
    }

    this.freqtTimesType = type.name;
    type.active = true;
  }
  
  updateMonthRequncy(i:number){
    if(i = 0 ){
      this.monthFreqOptions[0].active = true;
      this.monthFreqOptions[1].active = false;
      this.isMonthFreqFirstOption=true;
    }else{
      this.monthFreqOptions[0].active = false;
      this.monthFreqOptions[1].active = true;
      this.isMonthFreqFirstOption=false;
    }
  }
  updateFrequncyDay(day) {
    if (day.checked) {
      this.selectedshortDays.push(this.shortDays[day.id]);
    } else {
      this.selectedshortDays.splice(this.shortDays.indexOf(day.id), 1);
    }

    this.selectedshortDayIds = [];
    for (var i = 0; i < this.selectedshortDays.length; i++) {
      for (var j = 0; j < this.shortDays.length; j++) {
        if (this.selectedshortDays[i] == this.shortDays[j]) {
          this.selectedshortDayIds.push(j);
        }
      }
    }

    this.selectedshortDaysStr = this.selectedshortDays.join(", ");
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading=true;
    let effort = {
      Hours: this.data.activity.effortInHour,
      Minutes: this.data.activity.effortInMinute,
      CommentText: this.data.activity.comment,
      Status: null,
      CompletedDate:
        this.data.activity.logDate != null
          ? moment(this.data.activity.logDate).format("LL")
          : null,
      StartTime:
        this.data.activity.startTime != null
          ? moment(this.data.activity.startTime).format("LLL")
          : null,
      EndTime:
        this.data.activity.endTime != null
          ? moment(this.data.activity.endTime).format("LLL")
          : null,
    };

    let submitData:{      
      RecurrenceInterval: number,
      RecurrenceType: number,
      RecurrenceOnWeekDays:any,
      RecurrenceEndsOnDate:any,
      RecurrenceEndsAfterTimes:number,
      RecurrenceDistribution:number,
      Description: string,
      TargetValue: any,
      ActualValue: any,
      Unit:any,
      IsImportant: any,
      IsFollowed: any,
      TacticId: any,
      Owner_UserId: any,
      DueDate:any,
      RecurrenceStartDate:any,
      ParentTeamId:any,
      Weight:any,
      Note:any,
      Effort:any,
      Files:any,
      Condition:any,
      RecurrenceOnMonthDate?:any,
      RecurrenceOnMonthDay?:any,
      ESP_RequestId:any,
      ESP_RequestNumber:any,
      ESP_RequestName:any,
      IsShared:any,
      MaxClaims:any,
      ShareWithIds:any,
      CalendarType:any,
      CalendarEventId:any,
    } = {
      RecurrenceInterval: this.numberOfTimes,
      RecurrenceType: this.isWeeks ? 1 : 2,
      RecurrenceOnWeekDays: this.selectedshortDayIds,
      RecurrenceEndsOnDate:
        this.repeatEndsOnDate != null
          ? moment(this.repeatEndsOnDate).format("LL")
          : null,
      RecurrenceEndsAfterTimes: this.repeatEndsAfterTimes,
      RecurrenceDistribution: this.selectedDistribution,
      Description: this.data.activity.title,
      TargetValue: this.data.activity.targetValue == null? 100:this.data.activity.targetValue ,
      ActualValue: this.data.activity.actualValue,
      Unit: this.data.activity.actualUnit,
      IsImportant: this.data.important,
      IsFollowed: this.data.follow,
      TacticId: this.data.selectedJob,
      Owner_UserId: this.data.isMine
        ? this.data.loggedInUserId
        : this.data.assignedTo,
      DueDate:
        this.data.activity.dueDate != null
          ? moment(this.data.activity.dueDate).format("LL")
          : null,
      RecurrenceStartDate:
          this.startDate != null
            ? moment(this.startDate).format("LL")
            : null,
      ParentTeamId: this.data.selectedProject,
      Weight: this.data.activity.weight,
      Note: this.data.activity.notes,
      Effort: effort,
      Files: this.data.files,
      Condition: this.data.selectedCondition,
      ESP_RequestId:this.data.requestId,
      ESP_RequestNumber:this.data.requestNumber,
      ESP_RequestName:this.data.requestName,
      IsShared:this.data.isShared,
      MaxClaims: this.data.maxClaims,
      ShareWithIds:this.data.shareWithIds,
      CalendarType: null,
      CalendarEventId:null,
    };

    if(!this.isWeeks){
      if(this.monthFreqOptions[0].active){
        submitData.RecurrenceOnMonthDate={
          Date: this.selectedNoOfDay,
          DateType: this.selectedNoOfDayOpt
        };
      }else{
        submitData.RecurrenceOnMonthDay={
          WeekDay: this.selectedNoOfDayOpt,
          WeekDayOccurrence: this.selectedSeqNoOfDay
        };
      }

    }


    this.getRecurringResults(submitData);

  }
  getRecurringResults(submitData){
          
    this._activitiesService.getRecurringResults(submitData, this.data.engProLoggedInUserId).subscribe(
      (resp) => {
        if (!!resp) {
          if (resp.ResponseCode == 2000) {
            this.openRecuringResultDialog(resp.ResponseResult.Results, submitData);
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
  openRecuringResultDialog(results, submitData): void {
    const dialogRef = this._dialog.open(RecurringResultDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // height: this.size == "XS" || this.size == "SM" ? "100%" : "495px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      panelClass:
        this.size == "XS" || this.size == "SM"
          ? "small-dialog"
          : "large-dialog",
      data: {
        results:results,
        numberOfTimes:this.numberOfTimes,
        freqtTimesType:this.freqtTimesType,
        selectedDayIds:this.selectedshortDayIds,
        repeatEndsDate:this.repeatEndsOnDateStr,
        distribution:this.selectedDistribution,
        targetValue:this.data.activity.targetValue == null ? 100:this.data.activity.targetValue,
        repeatEndsAfterTimes:this.repeatEndsAfterTimes,
        selectedSeqNoOfDay:this.selectedSeqNoOfDay,
        selectedNoOfDayOpt:this.selectedNoOfDayOpt,
        frequancyOption:this.isWeeks? null : this.isMonthFreqFirstOption,
        selectedNoOfDay:this.selectedNoOfDay,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this._dialogRef.close({ type : result, submitData: submitData});
    });
  }



}
