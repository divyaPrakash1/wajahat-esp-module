import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailComponent } from './detail.component';
import { ProjectDetailComponent } from './detail/detail.component';
import { HistoryComponent } from './history/history.component';
import { RequestsComponent } from './requests/requests.component';
import { RisksComponent } from './risks/risks.component';

const routes: Routes = [
  {
    path: 'requirements',
    loadChildren: () => import('./requirements/requirements.module').then(m => m.RequirementsModule)
  },
  {
    path: '',
    component: DetailComponent,
    children: [
      {
        path: '', //project/12345/deliverables
        component: ProjectDetailComponent, // another child route component that the router renders
      },
      {
        path: 'detail',
        component: ProjectDetailComponent,
      },
      {
        path: 'general',
        loadChildren: () => import('./inner-detail/inner-detail.module').then(module => module.InnerDetailModule),
      },
      {
        path: 'risks',
        component: RisksComponent,
      },
      {
        path: 'issues',
        component: RisksComponent,
      },
      {
        path: 'requests',
        component: RequestsComponent,
      },
      {
        path: 'sprints',
        loadChildren: () => import('./sprints/sprints.module').then(module => module.SprintsModule),
      },
      {
        path: 'activities',
        loadChildren: () => import('../../esp-activity-module/esp-activity.module').then(module => module.EspActivityModule),
        // resolve: {
        //   //theme: SetThemeResolverService,
        //   espAddon: EspTokenResolverService,
        // }
      },
      {
        path: 'history',
        component: HistoryComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailRoutingModule { }
