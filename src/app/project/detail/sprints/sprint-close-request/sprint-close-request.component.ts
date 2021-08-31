import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FormControl, Validators } from '@angular/forms';

export interface DialogData {
  selected: any;
}
@Component({
  selector: 'app-sprint-close-request',
  templateUrl: './sprint-close-request.component.html',
  styleUrls: ['./sprint-close-request.component.scss']
})
export class SprintCloseRequestComponent implements OnInit {
  email =  new FormControl('', [Validators.required, Validators.email]);
  selected: any = {};
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<SprintCloseRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.selected = this.data.selected;
    console.log(this.selected, this.data);
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    this.loading = true;
    if (this.email.value){
      this.http.post(environment.baseURL + '/api/Sprint/SendCloseSprintRequest', {
        subject: '',
        description: '',
        sprintId: this.selected.sprintId,
        sprintTitle: this.selected.title,
        closeStatus: this.selected.closedStatus,
        closedById: this.authService.userId,
        closedByName: this.authService.userName,
        closedOnDate: moment().utc().format(),
        requesteeId: 0,
        requesteeName: 'Exceeders',
        requesteeEmail: this.email.value
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
