import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { IdenediComponent } from './idenedi/idenedi.component';
import { MatSnackBarModule} from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AuthComponent,
    IdenediComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class AuthModule { }
