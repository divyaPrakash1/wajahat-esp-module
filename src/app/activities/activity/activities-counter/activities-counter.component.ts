import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ActivityAlertService } from '../../shared/alert/alert-activity.service';
import { ActivityResizeService } from '../../shared/services/resize-activity.service';
import { SharedActivityDataService } from '../../shared/services/shared-activity-data-activity.service';
import { SCREEN_SIZE } from '../../shared/shared-activity.enums';
import { ActivitiesService } from '../services/activities.service';

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
  subscription: Subscription;
  constructor( private _resizeService: ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private sharedActivityDataService: SharedActivityDataService,) {
      this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
        this.size = SCREEN_SIZE[x];
      });

      this.subscription = this.sharedActivityDataService.onMessage().subscribe(message => {
        if (message) {
            this.getActivitiesCounts();
        } else {
        }
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
