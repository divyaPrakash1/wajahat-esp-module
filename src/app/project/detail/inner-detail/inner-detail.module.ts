import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerDetailComponent } from './inner-detail.component';
import { GereralComponent } from '../general/general.component';
import { UsersComponent } from '../general/users/users.component';
import { AddProjectUserComponent } from '../general/add-project-user/add-project-user.component';
import { ProjectUserListingComponent } from '../general/project-user-listing/project-user-listing.component';
import { ProjectUserDeleteComponent } from '../general/project-user-delete/project-user-delete.component';
import { ProjectUserDetailComponent } from '../general/project-user-detail/project-user-detail.component';
import { LayoutModule } from 'src/app/layout/layout.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InnerDetailRoutingModule } from './inner-detail-routing.module';
import { _MatMenuDirectivesModule, MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    InnerDetailComponent,
    GereralComponent,
    UsersComponent,
    AddProjectUserComponent,
    ProjectUserListingComponent,
    ProjectUserDeleteComponent,
    ProjectUserDetailComponent
  ],
  imports: [
    CommonModule,
    InnerDetailRoutingModule,
    SharedModule,
    LayoutModule,
    _MatMenuDirectivesModule,
    MatMenuModule,
    MatIconModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ]
})
export class InnerDetailModule { }
