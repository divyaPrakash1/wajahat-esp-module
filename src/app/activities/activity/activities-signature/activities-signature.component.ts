import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Subscription, SubscriptionLike } from "rxjs";
import { Addon } from '../../shared/models/addon.model-activity';

@Component({
  selector: 'xcdrs-activities-signature',
  templateUrl: './activities-signature.component.html',
  styleUrls: ['./activities-signature.component.scss']
})
export class ActivitiesSignatureComponent implements OnInit, OnDestroy {


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

  constructor(
    private _router: Router, 
    private _actRoute: ActivatedRoute
    ) {
    this.tabIndex = this._actRoute.snapshot.queryParams['activeTab'];

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
  }

  ngOnInit(): void {
  }


  ngOnDestroy(){
  }

}
