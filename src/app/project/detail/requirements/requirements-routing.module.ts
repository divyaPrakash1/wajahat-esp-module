import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequirementsComponent } from './requirements.component';
import { RequirementAdvanceViewComponent } from './requirement-advance-view/requirement-advance-view.component';
import { RequirementBacklogListComponent } from './requirement-backlog-list/requirement-backlog-list.component';

const routes: Routes = [
  {
    path: '',
    component: RequirementsComponent,
    children: [
      {
        path: 'advance',
        component: RequirementAdvanceViewComponent,
      },
      {
        path: 'backlog',
        component: RequirementBacklogListComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequirementsRoutingModule { }
