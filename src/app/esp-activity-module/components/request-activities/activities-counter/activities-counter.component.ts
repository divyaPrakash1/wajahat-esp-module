import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../../esp-activity-module/alert/alert.service';
import { SCREEN_SIZE } from '../../../../esp-activity-module/enums/shared.enums';
import { ActivitiesService } from '../../../../esp-activity-module/services/activities.service';
import { ResizeService } from '../../../../esp-activity-module/services/resize.service';
import * as moment from 'moment';
import { delay } from 'rxjs/operators';
// import { AlertService } from 'src/app/esp-activity-module/alert/alert.service';
// import { SCREEN_SIZE } from 'src/app/esp-activity-module/enums/shared.enums';
// import { ActivitiesService } from 'src/app/esp-activity-module/services/activities.service';
// import { ResizeService } from 'src/app/esp-activity-module/services/resize.service';
// import { ActivitiesService } from 'src/app/request/activities/services/activities.service';
// import { AlertService } from 'src/app/request/shared/alert/alert.service';
// import { ResizeService } from 'src/app/request/shared/services/resize.service';
// import { SCREEN_SIZE } from 'src/app/request/shared/shared.enums';

@Component({
  selector: 'xcdrs-activities-counter',
  templateUrl: './activities-counter.component.html',
  styleUrls: ['./activities-counter.component.scss']
})
export class ActivitiesCounterComponent implements OnInit {
  @Input() requestId!:number;
  @Input() showActivitiesTabs:boolean=false;

  isLoading:boolean=false;
  isError:boolean=false;
  dataLoaded:boolean=false;
  size!:string;
  selectedFiltersIds: any = {
    IsFollowed: true,
    IsImportant: false,
    StatusIds: [6, 5],
  };
  search: string = '';
  selectedFilters: Array<any> = [];
  counters: any ={
    open: {name:"Open" , value:null},
    overdue: {name:"Overdue" , value:null},
    // planned: {name:"Planned" , value:null},
    closed: {name:"Closed" , value:null},
    backlog: {name:"Backlog" , value:null},
    totalTime: {name:"Total Time" , value:{
      hrs:null,
      mins:null
    }},
  }
  constructor( private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService) {
      this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
        this.size = SCREEN_SIZE[x];
      });
    }

  ngOnInit(): void {
    this.getActivitiesCounts();
  }

  getActivitiesCounts(){
    this.isLoading=true;
    this._activitiesService.getStatsForESPRequest(this.requestId, this.selectedFiltersIds).subscribe((resp:any)=>{
      if(!!resp && resp.ResponseCode == 2000){
        this.counters.open.value = resp.ResponseResult.Stats.OpenCount;
        this.counters.overdue.value = resp.ResponseResult.Stats.OverdueCount;
        // this.counters.planned.value = resp.ResponseResult.Stats.PlannedCount;
        this.counters.closed.value = resp.ResponseResult.Stats.ClosedCount;
        this.counters.backlog.value = resp.ResponseResult.Stats.BacklogCount;
        this.counters.totalTime.value.hrs = Math.floor(
          moment.duration(resp.ResponseResult.Stats.EffortSum, "minutes").asHours()
        );
        this.counters.totalTime.value.mins =   Math.floor(
          moment
            .duration(
              moment.duration(resp.ResponseResult.Stats.EffortSum, "minutes").asHours() -
                Math.floor(
                  moment.duration(resp.ResponseResult.Stats.EffortSum, "minutes").asHours()
                ),
              "hours"
            )
            .asMinutes()
        );
        this.dataLoaded = true;
        this.isError = false;
        this.isLoading = false;
      }else{
        this.dataLoaded = true;
        this.isError = false;
        this.isLoading = false;
        this._alertService.error(resp.ResponseMessage, {
          timeout: 3000,
        });
      }
    },
    (error: Error): void => {
      this.isError = true;
      this.dataLoaded = false;
      this.isLoading = false;
    });
  }

}
