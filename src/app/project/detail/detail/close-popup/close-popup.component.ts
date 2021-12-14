import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  list: Array<any>;
  projectid: number;
  selected: number;
}
@Component({
  selector: 'app-close-popup',
  templateUrl: './close-popup.component.html',
  styleUrls: ['./close-popup.component.scss']
})
export class ClosePopupComponent implements OnInit {
  allowed: Array<any> = ['Partially Completed', 'Cancelled', 'Completed'];
  stateList: Array<any> = [];
  selected = 0;
  projectId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<ClosePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.selected = this.data.selected;
    this.projectId = this.data.projectid;
    this.stateList = this.data.list.filter((item: any) => this.allowed.includes(item.name));
  }
  radioChange(state: any): void{
    this.selected = state;
  }
  cancel(event: any): void{
    this.dialogRef.close();
  }
  change(event: any): void{
    const state = this.stateList.find((s: any) => s.id === this.selected);
    if (state){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Project/CloseProject', {
        projectId: this.projectId,
        stateId: this.selected,
        stateName: state.name,
        currentDate: moment().utc().format()
      }).subscribe({
        next: (result: any) => {
          this.http.post(environment.baseURL + '/api/Project/UpdateProjectState', {
            projectId: this.projectId,
            stateId: this.selected,
            stateName: state.name,
            currentDate: moment().utc().format()
          }).subscribe({
            next: (result: any) => {
              this.loading = false;
              this.dialogRef.close({reload: true});
            },
            error: (err: any) => {
              this.loading = false;
              this.snackbar.open(err.message || 'Error occured while closing project', '', {
                duration: 3000,
                horizontalPosition: 'start',
              });
            }
          });
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while closing project', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
  }

}
