import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectComponent } from './project.component';
import { ListingComponent } from './listing/listing.component';
import { AuthGuard } from '../shared/guards/auth.guard';
//import { AddComponent } from './add/add.component';

const routes: Routes = [
  {
    path: 'add',
    loadChildren: () => import('./project-add/project-add.module').then(m => m.ProjectAddModule)
  },
  {
    path: 'update/:id',
    loadChildren: () => import('./project-add/project-add.module').then(m => m.ProjectAddModule)
  },
  {
    path: '',
    component: ProjectComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list',
        component: ListingComponent,
      },
      // {
      //   path: 'add-project',
      //   component: AddComponent,
      // },
      {
        path: ':id',
        loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule)
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
