import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  requirementId: number;
}

@Component({
  selector: 'app-requirement-delete-popup',
  templateUrl: './requirement-delete-popup.component.html',
  styleUrls: ['./requirement-delete-popup.component.scss']
})
export class RequirementDeletePopupComponent implements OnInit {
  requirementId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RequirementDeletePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.requirementId = this.data.requirementId;
  }
  cancel(event: any): void{
    this.dialogRef.close({});
  }
  change(event: any): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Requirements/DeleteRequirement', {
      requirementId: this.requirementId
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while deleting requirement', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }
}
