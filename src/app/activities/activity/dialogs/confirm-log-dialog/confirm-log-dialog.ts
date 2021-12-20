import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
@Component({
  selector: "xcdrs-confirm-log-dialog",
  templateUrl: "./confirm-log-dialog.html",
  styleUrls: ["./confirm-log-dialog.scss"],
})
export class ConfirmLogDialog implements OnInit {
  closeAs: string;
  isLoading: boolean = false;
  constructor(
    public _dialogRef: MatDialogRef<ConfirmLogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { form: any }
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this._dialogRef.close({ data: this.data });
  }
}
