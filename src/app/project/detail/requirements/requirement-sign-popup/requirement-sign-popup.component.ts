import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';

export interface DialogData {
  requirementId: number;
}
@Component({
  selector: 'app-requirement-sign-popup',
  templateUrl: './requirement-sign-popup.component.html',
  styleUrls: ['./requirement-sign-popup.component.scss']
})
export class RequirementSignPopupComponent implements OnInit {
  requirementId = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RequirementSignPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.requirementId = this.data.requirementId;
  }
  cancel(event: any): void{
    this.dialogRef.close({});
  }
  change(event: any): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Project/AddSignature', {
      module: 'requirement',
      entityId: this.requirementId,
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
        this.snackbar.open(err.message || 'Error occured while singing requirement', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }
}
