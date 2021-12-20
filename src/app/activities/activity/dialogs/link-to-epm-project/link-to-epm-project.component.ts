import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { delay } from 'rxjs/operators';
import { ActivityResizeService } from '../../../shared/services/resize-activity.service';
import { SCREEN_SIZE } from '../../../shared/shared-activity.enums';
import { AuthEpmDialogComponent } from '../auth-epm-dialog/auth-epm-dialog.component';
import { EpmSettingsDialogComponent } from '../epm-settings-dialog/epm-settings-dialog.component';

@Component({
  selector: 'xcdrs-link-to-epm-project',
  templateUrl: './link-to-epm-project.component.html',
  styleUrls: ['./link-to-epm-project.component.scss']
})
export class LinkToEpmProjectComponent implements OnInit {
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  size:string;
  form: FormGroup;
  isEpmConnected: boolean=!!localStorage.getItem("epmConnectuionData")?true:false;
  epmConnectionData:any=!!localStorage.getItem("epmConnectuionData")? JSON.parse(localStorage.getItem("epmConnectuionData")) : null;

  constructor(
    private _fb: FormBuilder,
    private _resizeService:ActivityResizeService, 
     public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<EpmSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEpmConnected:boolean }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.isLoading= true;
    this.form = this._fb.group({
      accountLink: new FormControl(this.epmConnectionData !=null ?this.epmConnectionData.Url: null),
    });
    this.dataLoaded= true;    
    this.isLoading= false;
  }


  onNoClick(): void {
    this.cancel();
  }

  cancel(){
    this._dialogRef.close(this.isEpmConnected);
  }

  submit() {
    const dialogRef = this._dialog.open(AuthEpmDialogComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data:{accountLink:this.form.value.accountLink}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!!result){
        this.isEpmConnected = true;
      }else{
        this.isEpmConnected = false;
      }
      
      this._dialogRef.close(this.isEpmConnected);
    });
  }

}
