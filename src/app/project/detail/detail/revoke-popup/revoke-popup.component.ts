import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';

export interface DialogData {
  projectid: number;
}

@Component({
  selector: 'app-revoke-popup',
  templateUrl: './revoke-popup.component.html',
  styleUrls: ['./revoke-popup.component.scss']
})
export class RevokePopupComponent implements OnInit {
  projectId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RevokePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.projectId = this.data.projectid;
  }
  cancel(event: any): void{
    this.dialogRef.close();
  }
  change(event: any): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Project/RevokeSignature', {
      module: 'project',
      entityId: this.projectId,
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
        this.snackbar.open(err.message || 'Error occured while singing project', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
