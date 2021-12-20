import { Component, OnInit, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "xcdrs-confirm-reject-dialog",
  templateUrl: "./confirm-reject-dialog.html",
  styleUrls: ["./confirm-reject-dialog.scss"],
})
export class ConfirmRejectDialog implements OnInit {
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(
    private _router: Router,
    public _dialogRef: MatDialogRef<ConfirmRejectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { form: any },
    private route: ActivatedRoute
  ) {
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

  ngOnInit(): void {}

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this._dialogRef.close();
    this._router.navigate([`pages/activities`], { queryParams: { 
      fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
      SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
  }
}
