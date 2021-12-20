import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ActivitiesMainComponent } from "./activities-main/activities-main.component";
import { ActivityDetailsComponent } from "./activities-main/activity-details/activity-details.component";
import { FollowedUserDetailsComponent } from "./activities-main/following-activities/followed-user-details/followed-user-details.component";
import { SharedActivitiesComponent } from './activities-main/following-activities/shared-activities/shared-activities.component';
import { ActivitiesSignatureComponent } from "./activities-signature/activities-signature.component";
import { CarouselDetailsComponent } from "./carousel/carousel-details/carousel-details.component";

const routes: Routes = [
  {
    path: "",
    component: ActivitiesMainComponent,
  },
  {
    path: "signature",
    component: ActivitiesSignatureComponent,
  },
  {
    path: "details/:id",
    component: ActivityDetailsComponent,
  },
  {
    path: "details/:activityType/:id",
    component: ActivityDetailsComponent,
  },
  {
    path: "details/:parentProjectId/:activityType/:id",
    component: ActivityDetailsComponent,
  },

  {
    path: "following/details/:id",
    component: FollowedUserDetailsComponent,
  },
  {
    path: "following/details/:activityType/:id",
    component: FollowedUserDetailsComponent,
  },
  {
    path: "following/shared/details",
    component: SharedActivitiesComponent,
  },
  {
    path: "new/:type",
    component: CarouselDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivitiesRoutingModule {}
