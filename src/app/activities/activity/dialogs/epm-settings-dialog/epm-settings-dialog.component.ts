import { Component, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { delay } from "rxjs/operators";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { LinkToEpmProjectComponent } from "../link-to-epm-project/link-to-epm-project.component";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { ActivitiesService } from "../../services/activities.service";

@Component({
  selector: 'xcdrs-epm-settings-dialog',
  templateUrl: './epm-settings-dialog.component.html',
  styleUrls: ['./epm-settings-dialog.component.scss']
})
export class EpmSettingsDialogComponent implements OnInit {
  
  isLoading: boolean = false;
  isEpmConnected: boolean=!!localStorage.getItem("epmConnectuionData")?true:false;
  size:string;
  isArabic: boolean = false;
  constructor(
    private _resizeService:ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _router: Router,   
     public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<EpmSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEpmConnected:boolean }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    this.isEpmConnected = this.data.isEpmConnected;
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  disconnectEpmAccount(){
    this.isLoading=true;

    this._activitiesService
        .removeEPMSettings()
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              this.isEpmConnected = false;
              localStorage.removeItem("epmConnectuionData");
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
              this.isLoading=false;
              this.cancel();
            }else{
              this.isLoading=false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
              this.cancel();
            } 
          }
        });
  }

  linkToEpmAccount(): void {
    const dialogRef = this._dialog.open(LinkToEpmProjectComponent, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(!!result){
        this.isEpmConnected = result;
      }
    });
  }

  onNoClick(): void {
    this.cancel();
  }

  cancel(){
    this._dialogRef.close(this.isEpmConnected);
  }


}
