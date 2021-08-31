import { Component, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "xcdrs-confirm-reject-dialog",
  templateUrl: "./confirm-reject-dialog.html",
  styleUrls: ["./confirm-reject-dialog.scss"],
})
export class ConfirmRejectDialog implements OnInit {
  constructor(
    private _router: Router,
    public _dialogRef: MatDialogRef<ConfirmRejectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { form: any }
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this._dialogRef.close();
    this._router.navigate([`pages/activities`]);
  }
}
