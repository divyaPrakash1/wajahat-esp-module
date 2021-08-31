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
  selector: 'app-project-state-popup',
  templateUrl: './project-state-popup.component.html',
  styleUrls: ['./project-state-popup.component.scss']
})
export class ProjectStatePopupComponent implements OnInit {
  notAllowed: Array<any> = ['Partially Completed', 'Cancelled', 'Completed'];
  stateList: Array<any> = [];
  selected = 0;
  projectId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<ProjectStatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    console.log(this);
    this.selected = this.data.selected;
    this.projectId = this.data.projectid;
    this.stateList = this.data.list.filter((item: any) => !this.notAllowed.includes(item.name));
  }
  radioChange(state: any): void{
    this.selected = state;
  }
  cancel(): void{
    this.dialogRef.close();
  }
  change(): void{
    const state = this.stateList.find((s: any) => s.id === this.selected);
    if (state){
      this.loading = true;
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
          this.snackbar.open(err.message || 'Error occured while changing project state', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
  }

}
