import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  requirementId: number;
}
@Component({
  selector: 'app-requirement-close-popup',
  templateUrl: './requirement-close-popup.component.html',
  styleUrls: ['./requirement-close-popup.component.scss']
})
export class RequirementClosePopupComponent implements OnInit {
  stateList: Array<any> = [
    {
      id: 1,
      name: 'Complete'
    },
    {
      id: 2,
      name: 'Cancel'
    }
  ];
  selected = 0;
  requirementId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RequirementClosePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.requirementId = this.data.requirementId;
  }
  radioChange(state: any): void{
    this.selected = state;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    if (this.selected === 1){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Requirements/CloseRequirement', {
        requirementId: this.requirementId
      }).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.dialogRef.close({reload: true});
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while closing requirement', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
    else if (this.selected === 2){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Requirements/CancelRequirement', {
        requirementId: this.requirementId
      }).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.dialogRef.close({reload: true});
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while closing requirement', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
  }


}
