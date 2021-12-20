import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

@Component({
  selector: "xcdrs-confirm-create-dialog",
  templateUrl: "./confirm-create-dialog.html",
  styleUrls: ["./confirm-create-dialog.scss"],
})
export class ConfirmCreateDialog implements OnInit {
  isLoading: boolean = false;
  constructor(
    public _dialogRef: MatDialogRef<ConfirmCreateDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { form: any; isPlanned: boolean; isReassigned: boolean }
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this._dialogRef.close();
  }

  submit() {
    this._dialogRef.close({ data: this.data });
  }
}
