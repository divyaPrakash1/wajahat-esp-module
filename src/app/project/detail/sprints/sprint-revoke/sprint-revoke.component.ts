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
  selector: 'app-sprint-revoke',
  templateUrl: './sprint-revoke.component.html',
  styleUrls: ['./sprint-revoke.component.scss']
})
export class SprintRevokeComponent implements OnInit {
  id = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<SprintRevokeComponent>,
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
    this.http.post(environment.baseURL + '/api/Project/RevokeSignature', {
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
        this.snackbar.open(err.message || 'Error occured while revoking your signature', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
