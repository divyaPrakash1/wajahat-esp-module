import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Subscription, SubscriptionLike } from "rxjs";
import { Addon } from '../../shared/models/addon.model-activity';
import { CentralizedActivity } from "../enums";
import { ActivitySharedService } from "../services/activity-shared.service";
import { LabelService } from "../services/label-service";
@Component({
  selector: "xcdrs-activities-main",
  templateUrl: "./activities-main.component.html",
  styleUrls: ["./activities-main.component.scss"],
})
export class ActivitiesMainComponent implements OnInit, OnDestroy {

  @Input() selectedIndex: number | null;
  tabIndex: number = 0;
  isEngProEnabled: boolean = false;
  isEngProDataLoaded: boolean = false;
  engagementProLoggedInUserId: any = null;
  engagementProUsers: Array<any> = [];
  engagementProTeams: Array<any> = [];

  isOppProEnabled: boolean = false;
  isOppProDataLoaded: boolean = false;
  oppProData: any = null;
  
  isEspEnabled: boolean = false;
  isEspAddonLoaded: boolean = false;
  espAddon:Addon;
  paramsSubscription : Subscription;
  subscriptions = [];
  myValueSub: SubscriptionLike;

  applicationName:string = '';
  applicationId:any;
  applicationUrl: any;
  activeBreaadcrumb:string = '';
  SSId:any;

  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;

  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;

  constructor(
    private _router: Router, 
    private _actRoute: ActivatedRoute,
    public labelService: LabelService,
    private activitySharedService: ActivitySharedService,
    ) {
    this.tabIndex = this._actRoute.snapshot.queryParams['activeTab'];
    this.applicationId = this._actRoute.snapshot.queryParams['SourceObjectId'];

    this.myValueSub = this._actRoute.data.subscribe((data) => {
      if (!!data.engProData) {
        //data.engProData.subscribe((data) => {
        if (data.engProData.code == "001" && !!data.engProData.result) {
          this.engagementProLoggedInUserId = data.engProData.result.userId;
          this.isEngProEnabled = true;
        }
        this.isEngProDataLoaded = true;
        //});
      } else {
        this.isEngProDataLoaded = true;
      }

      if (!!data.espAddon) {
        this.espAddon = data.espAddon;
        this.isEspEnabled=true;
        this.isEspAddonLoaded = true;

      } else {
        this.isEspAddonLoaded = true;
      }


      if (!!data.oppProData) {
        // data.oppProData.subscribe((data) => {
        if (data.oppProData.code == "001" && !!data.oppProData.result) {
          this.oppProData = data.oppProData.result;

          this.isOppProEnabled = true;
        }
        this.isOppProDataLoaded = true;
        // });
      } else {
        this.isOppProDataLoaded = true;
      }
    })
  //);

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
    this.fromTab == 'ScoreCard' ? this.activeBreaadcrumb = this.fromTab : this.getActiveBreadCrumbName();
  });
  }

  ngOnInit() {
    let ssId = this.SourceSystemId;
    this.SSId = ssId;
    let soId = this.SourceSystemId;
    this.activitySharedService.currentMessage.subscribe((message) => {
      if(soId == '1') {
        this.applicationName = localStorage.getItem("ApplicationName") ?? '';
      }
    });
    if(soId == '1') {
      this.applicationName = localStorage.getItem("ApplicationName") ?? '';
    }
    this.applicationId = this.SourceObjectId;
    this.applicationUrl = '/pages/applications/', this.applicationId;
  }

  getActiveBreadCrumbName() {
    this.activeBreaadcrumb = !this.SourceSystemId ? 'SimpleStrata' : this.SourceSystemId == '1' ? 'ESP' : this.SourceSystemId == '2' ? 'EngPro' : this.SourceSystemId == '3' ? 'OppPro' : this.SourceSystemId == '4' ? 'Epm' : '';
  }

  goToDefinition() {
    this._router.navigate(['/pages/applications/', this.SourceObjectId]);
  }

  ngOnDestroy(){
    if (this.myValueSub) {
      this.myValueSub.unsubscribe();
  }
  }
}
