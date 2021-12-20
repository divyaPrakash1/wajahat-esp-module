import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { ActivitiesService } from "../../services/activities.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
@Component({
  selector: "xcdrs-confirm-close-dialog",
  templateUrl: "./confirm-close-dialog.html",
  styleUrls: ["./confirm-close-dialog.scss"],
})
export class ConfirmCloseDialog implements OnInit {
  closeAs: string;
  isLoading: boolean = false;
  size: any;
  isArabic: boolean = false;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(
    private _router: Router,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _resizeService: ActivityResizeService,
    public _dialogRef: MatDialogRef<ConfirmCloseDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      form: any;
      submitData: any;
      engProLoggedInUserId: string;
      isEngProActivity: boolean;
    },
    private route: ActivatedRoute
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
    this.route.queryParams.subscribe(params => {
      if (params["SourceSystemId"]) {
        this.SourceSystemId = +params["SourceSystemId"];
      } else {
        this.SourceSystemId = null;
      }
      if (params["SourceTenantId"]) {
        this.SourceTenantId = +params["SourceTenantId"];
      } else {
        this.SourceTenantId = null;
      }
      if (params["SourceObjectTypeId"]) {
        this.SourceObjectTypeId = +params["SourceObjectTypeId"];
      } else {
        this.SourceObjectTypeId = null;
      }
      if (params["SourceObjectId"]) {
        this.SourceObjectId = +params["SourceObjectId"];
      } else {
        this.SourceObjectId = null;
      }
      if (params["fromTab"]) {
        this.fromTab = params["fromTab"];
      } else {
        this.fromTab = null;
      }
      if (params["teamId"]) {
        this.teamId = +params["teamId"];
      } else {
        this.teamId = null;
      }
      if (params["selectedTab"]) {
        this.scoreCardSelectedTab = +params["selectedTab"];
      } else {
        this.scoreCardSelectedTab = null;
      }
    })
  }

  ngOnInit(): void {
    this.getLanguage();
    this.data.form.closeAs == 0
      ? (this.closeAs = "Done")
      : (this.closeAs = "Cancelled");
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this.isLoading = true;
    this._activitiesService
      .updateActualValue(
        this.data.submitData,
        this.data.engProLoggedInUserId,
        this.data.isEngProActivity
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
              this._dialogRef.close();
              this.isLoading = false;
              this._router.navigate([`pages/activities`], { queryParams: { 
                fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
            } else {
              this._dialogRef.close();
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });

              this.isLoading = false;
            }
          }
        },
        (error: Error): void => {}
      );
  }

  cancel() {
    this._dialogRef.close();
  }
}
