import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InnerDetailComponent } from './inner-detail.component';

const routes: Routes = [
  {
    path: '',
    component: InnerDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InnerDetailRoutingModule { }
