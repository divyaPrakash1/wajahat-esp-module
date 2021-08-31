import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SCREEN_SIZE } from '../../../../esp-activity-module/enums/shared.enums';
import { ResizeService } from '../../../../esp-activity-module/services/resize.service';
import { SimplestrataAuthService } from '../../../../esp-activity-module/services/simplestrata-auth.service';
import { EventEmitter } from 'events';
import { delay } from 'rxjs/operators';
// import { SCREEN_SIZE } from 'src/app/esp-activity-module/enums/shared.enums';
// import { ResizeService } from 'src/app/esp-activity-module/services/resize.service';
// import { SimplestrataAuthService } from 'src/app/esp-activity-module/services/simplestrata-auth.service';
import { ActivitiesCounterComponent } from '../activities-counter/activities-counter.component';
//import { ResizeService } from '../../../../request/shared/services/resize.service';
//import { SimplestrataAuthService } from '../../../..//request/shared/services/simplestrata-auth.service';
//import { SCREEN_SIZE } from '../../../../request/shared/shared.enums';
// import { ActivitiesCounterComponent } from './activities-counter/activities-counter.component';
// import { AllActivitiesComponent } from './all-activities/all-activities.component';

@Component({
  selector: 'xcdrs-request-activities-main',
  templateUrl: './request-activities-main.component.html',
  styleUrls: ['./request-activities-main.component.scss']
})
export class RequestActivitiesMainComponent implements OnInit {
  @Input() requestId!:number;
  @Input() requestModuleName!:any;
  @Input() requestName!:any;
  @Input() showActivitiesTabs!:boolean;
  @Input() isMyspace!:boolean;
  @ViewChild(ActivitiesCounterComponent) activitiesCounter: ActivitiesCounterComponent | undefined;
  size!:string;
  isLoading:boolean=false;
  dataLoaded:boolean=false;
  tabIndex:number=0;

  constructor(private _actRoute: ActivatedRoute,
    private _resizeService: ResizeService,
    private _router: Router,
    private _simplestrataAuthService: SimplestrataAuthService) {
    this.tabIndex = this._actRoute.snapshot.queryParams['activeTab'];
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
   }

  ngOnInit(): void {
  }

  reload(ev:any){
    if(ev==true){
      this.activitiesCounter?.getActivitiesCounts();
    }
  }
}
