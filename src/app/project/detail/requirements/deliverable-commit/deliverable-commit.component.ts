import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormControl, Validators } from '@angular/forms';

export interface DialogData {
  id: any;
  projectId: any;
}

@Component({
  selector: 'app-deliverable-commit',
  templateUrl: './deliverable-commit.component.html',
  styleUrls: ['./deliverable-commit.component.scss']
})
export class DeliverableCommitComponent implements OnInit {

  id: any;
  projectId: any;
  loading = true;
  list: Array<any> = [];
  selected:any = 0;

  constructor(
    public dialogRef: MatDialogRef<DeliverableCommitComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;
    this.projectId = this.data.projectId;
    this.http.post(environment.baseURL + '/api/Sprint/GetAllSprintData', {
      projectId: this.projectId,
      search: '',
      pageNum: 0,
      pageSize: 50,
      filterObject: {
        sprintStatus: []
      },
      currentDateTime: moment().utc().format()
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.list = result.result.map((s: any) => {
          s.colorCode = s.sprintStatus === 'Current' ? '8622b7' : '1da9e7';
          return s;
        });
      },
      error: (err: any) => {
        this.cancel();
      }
    });
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  onClick(sprint: any): void{
    this.selected = sprint;
  }
  change(): void{
    if (this.selected !== 0){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Sprint/AddDeliverablesToSprint', {
        deliverableIds: [this.id],
        sprintId: this.selected.sprintId,
      }).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.dialogRef.close({reload: true});
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while commit', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
          this.cancel();
        }
      });
    }
  }

}
