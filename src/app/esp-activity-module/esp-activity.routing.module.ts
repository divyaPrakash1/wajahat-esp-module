import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { Roles } from './enums/roles-enum';
import { SimpleStrataTokenResolverService } from '../esp-activity-module/services/simplestrata-auth.service';
import { EspTokenResolverService } from './services/esp-auth.service';
import { AuthProposalGuard } from './guards/auth-proposal-guard.service';
import { ActivityDetailsComponent } from './components/activities-main/activity-details/activity-details.component';
// import { EspTokenResolverService } from '../esp-activity-module/services/';



const routes: Routes = [
  // {
  //   path: 'applications/:id',
  // },
  {
    path: ':id',
    component: ApplicationDetailComponent,
    data: {
      title: 'Application', pageTitle: 'Application', expectedRole: [Roles.Admin, Roles.User, Roles.Applicant],
      breadcrumb: {
        hasbreadcrumb: true, prevPageLink: '/applications', prevPageLabel: 'submittedApp',
        currentPageLabel: 'selectedApplication'
      }
    },
    canActivate: [AuthProposalGuard],
    resolve: {
      espAddon: EspTokenResolverService,
      simpleStrataAddon: SimpleStrataTokenResolverService,
    }
  },
  {
    path: 'details/:id',
    component: ActivityDetailsComponent,
  },
  {
    path: 'details/:activityType/:id',
    component: ActivityDetailsComponent,
  },
  {
    path: 'details/:parentProjectId/:activityType/:id',
    component: ActivityDetailsComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  exports: [RouterModule]
})
export class EspActivityRoutingModule { }
