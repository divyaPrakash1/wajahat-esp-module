import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { delay } from 'rxjs/operators';
import { ActivityAlertService } from '../../../shared/alert/alert-activity.service';
import { ActivityResizeService } from '../../../shared/services/resize-activity.service';
import { SCREEN_SIZE } from '../../../shared/shared-activity.enums';
import { ActivitiesService } from '../../services/activities.service';
import { LinkToEpmProjectComponent } from '../link-to-epm-project/link-to-epm-project.component';

@Component({
  selector: 'xcdrs-auth-epm-dialog',
  templateUrl: './auth-epm-dialog.component.html',
  styleUrls: ['./auth-epm-dialog.component.scss']
})
export class AuthEpmDialogComponent implements OnInit {
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  isEpmConnected: boolean=!!localStorage.getItem("epmConnectuionData")?true:false;
  epmConnectionData:any=!!localStorage.getItem("epmConnectuionData")? JSON.parse(localStorage.getItem("epmConnectuionData")) : null;
  size:string;
  form: FormGroup;
  type:string="password";
  submitErr:number=null;
  constructor(
    private _fb: FormBuilder,
    private _resizeService:ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _router: Router,   
     public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<LinkToEpmProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accountLink:string }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      userName: new FormControl(this.epmConnectionData !=null ?this.epmConnectionData.UserName: null),
      password: new FormControl(this.epmConnectionData !=null ?this.epmConnectionData.Password: null),
    });
    this.onChanges();
    this.dataLoaded= true; 
  }


  onNoClick(): void {
    this.cancel();
  }

  cancel(){
    this._dialogRef.close();
  }

  submit() {
    this.isLoading=true;
    var data = {
      Password: this.form.value.password,
      Url: this.data.accountLink,
      UserName:this.form.value.userName,
    };

    this._activitiesService
        .updateEPMSettings(
          data
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              localStorage.setItem("epmConnectuionData",JSON.stringify(data));
              this._dialogRef.close(resp.ResponseCode);
            } 
            this.submitErr=resp.ResponseCode;
            this.isLoading=false;
          }
        });
  }


  onChanges(): void {

    this.form.get("password").valueChanges.subscribe((val) => {
      this.submitErr = null;
    });

    this.form.get("userName").valueChanges.subscribe((val) => {
        this.submitErr = null;
    });

  }

}
