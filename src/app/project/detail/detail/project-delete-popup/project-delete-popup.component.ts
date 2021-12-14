import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  projectid: number;
}

@Component({
  selector: 'app-project-delete-popup',
  templateUrl: './project-delete-popup.component.html',
  styleUrls: ['./project-delete-popup.component.scss']
})
export class ProjectDeletePopupComponent implements OnInit {
  projectId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<ProjectDeletePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.projectId = this.data.projectid;
  }
  cancel(event: any): void{
    this.dialogRef.close();
  }
  change(event: any): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Project/DeleteProject', {
      projectId: this.projectId,
      currentDate: moment().utc().format()
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while singing project', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
