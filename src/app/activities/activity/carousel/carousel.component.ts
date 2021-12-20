import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ActivitiesService } from "../services/activities.service";
import { ActivityAlertService } from "../../shared/alert/alert-activity.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ActivityResizeService } from "../../shared/services/resize-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../shared/shared-activity.enums";
import { Activity } from "../models/activity";
declare var $: any;

@Component({
  selector: "xcdrs-carousel",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
})
export class CarouselComponent implements OnInit {
  @Input() listItems: Array<any>;
  @Input() listType: string;
  @Output() activity: EventEmitter<Activity> = new EventEmitter<Activity>();
  size: any;
  lastDone: boolean = false;
  isEngProEnabled: boolean = false;
  isEngProDataLoaded: boolean = false;
  engProLoggedInUserId: any = null;
  isEngProActivity: boolean = false;
  isArabic: boolean = false;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _resizeService: ActivityResizeService,
    private _router: Router,
    private _actRoute: ActivatedRoute
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });

    this._actRoute.queryParams.subscribe(params => {
      if (params["SourceSystemId"]) {
        this.SourceSystemId = +params["SourceSystemId"];
      } else {
        this.SourceSystemId = null;
      }
      if (params["SourceTenantId"]) {
        this.SourceTenantId = +params["SourceTenantId"];
      } else {
        this.SourceTenantId = null;
      }
      if (params["SourceObjectTypeId"]) {
        this.SourceObjectTypeId = +params["SourceObjectTypeId"];
      } else {
        this.SourceObjectTypeId = null;
      }
      if (params["SourceObjectId"]) {
        this.SourceObjectId = +params["SourceObjectId"];
      } else {
        this.SourceObjectId = null;
      }
      if (params["fromTab"]) {
        this.fromTab = params["fromTab"];
      } else {
        this.fromTab = null;
      }
      if (params["teamId"]) {
        this.teamId = +params["teamId"];
      } else {
        this.teamId = null;
      }
      if (params["selectedTab"]) {
        this.scoreCardSelectedTab = +params["selectedTab"];
      } else {
        this.scoreCardSelectedTab = null;
      }
    })

    // this.isEngProActivity = !!this._actRoute.snapshot.params.activityType
    //   ? true
    //   : false;
  }

  ngOnInit(): void {
    this._actRoute.data.subscribe((data) => {
      if (!!data) {
        if (!!data.engProData) {
          //  data.engProData.subscribe((data) => {
          if (data.engProData.code == "001" && !!data.engProData.result) {
            this.engProLoggedInUserId = data.engProData.result.userId;
            this.isEngProEnabled = true;
          }
          // });
        }
      }
    });
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  accept(item) {
    this.isEngProActivity = item.appType == 1 ? true : false;
    if (this.listType == "assigned") {
      this._activitiesService
        .acceptAssigned(
          item.id,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.listItems.splice(this.listItems.indexOf(item), 1);
              this.activity.emit(item);
              this._alertService.success(
                !this.isArabic ? 
                "You accepted the “" +
                  item.description +
                  "” activity.Now you can find it under the “Mine” tab."
                : `لقد قبلت نشاط ${item.description}. يمكنك الآن العثور عليه ضمن النشاطات الخاصة بك.`,
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
        });
    } else {
      this._activitiesService
        .approveReported(
          item.id,
          this.engProLoggedInUserId,
          this.isEngProActivity
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.listItems.splice(this.listItems.indexOf(item), 1);
              this.activity.emit(item);
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 300,
              });
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 300,
              });
            }
          }
        });
    }
  }

  claim(item){
    this._activitiesService
        .claim(
          item.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.listItems.splice(this.listItems.indexOf(item), 1);
              this.activity.emit(item);
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 300,
              });
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 300,
              });
            }
          }
        });
  }

  decideLater(item) {
    this.goToNextCard();
  }

  goToPrevCard(): void {
    this.listItems.unshift(this.listItems.pop());
  }

  goToNextCard(): void {
    this.listItems.push(this.listItems.shift());
  }

  openActivityDetails(row: Activity) {
  //   if (row.appType == 4) {
  //   this._router.navigate([`pages/activities/details/espAct/${row.id}`]);
  // } else 
  if(row.isShared){
    localStorage.setItem("preURL", "/pages/activities" );
  }

  if (row.appType == 3) {
    this._router.navigate([`pages/activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`],  {
      queryParams: {
        accessedFrom: 'carousel',
        listType:this.listType,
        fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
        SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
      }
    });
  } else if (row.appType == 2) {
      this._router.navigate([`pages/activities/details/oppProAct/${row.id}`], {
        queryParams: {
          accessedFrom: 'carousel',
          listType:this.listType,
          fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
          SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
        }
      });
    } else if (row.appType == 1) {
      this._router.navigate([`pages/activities/details/engProAct/${row.id}`], {
        queryParams: {
          accessedFrom: 'carousel',
          listType:this.listType,
          fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
          SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
        }
      });
    } else {
      this._router.navigate([`pages/activities/details/${row.id}`], {
        queryParams: {
          accessedFrom: 'carousel',
          listType:this.listType,
          fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
          SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
        }
      });
    }
  }

  getAssignedActivity(){
    let url = `/pages/activities/new/${this.listType}`;
    this._router.navigate([url], { queryParams: { 
      fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
      SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }})
  }
}
