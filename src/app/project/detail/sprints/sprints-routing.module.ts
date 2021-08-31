import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SprintsComponent } from './sprints.component';

const routes: Routes = [
  {
    path: '',
    component: SprintsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SprintsRoutingModule { }
