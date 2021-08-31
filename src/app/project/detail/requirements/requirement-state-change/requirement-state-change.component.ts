import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  requirementId: number;
  state: number;
}
@Component({
  selector: 'app-requirement-state-change',
  templateUrl: './requirement-state-change.component.html',
  styleUrls: ['./requirement-state-change.component.scss']
})
export class RequirementStateChangeComponent implements OnInit {
  stateList: Array<any> = [
    {
      id: 1,
      name: 'Open'
    },
    {
      id: 2,
      name: 'In Progress'
    }
  ];
  selected = 0;
  requirementId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RequirementStateChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.requirementId = this.data.requirementId;
    this.selected = this.data.state;
  }
  radioChange(state: any): void{
    this.selected = state;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    if (this.selected === 1 || this.selected === 2){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Requirements/SetRequirementState', {
        requirementId: this.requirementId,
        state: this.selected === 1 ? 'Open' : 'InProgress'
      }).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.dialogRef.close({reload: true});
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while changing state', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
  }
}
