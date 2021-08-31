import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-sprint-sign',
  templateUrl: './sprint-sign.component.html',
  styleUrls: ['./sprint-sign.component.scss']
})
export class SprintSignComponent implements OnInit {
  id = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<SprintSignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Project/AddSignature', {
      module: 'sprints',
      entityId: this.id,
      userId: this.authService.userId,
      userName: this.authService.userName,
      currentDate: moment().utc().format()
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while singing sprint', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
