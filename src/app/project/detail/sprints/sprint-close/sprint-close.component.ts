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
  selector: 'app-sprint-close',
  templateUrl: './sprint-close.component.html',
  styleUrls: ['./sprint-close.component.scss']
})
export class SprintCloseComponent implements OnInit {
  stateList: Array<any> = [
    {
      id: 1,
      name: 'Complete'
    },
    {
      id: 2,
      name: 'Move To Next Sprint '
    },
    {
      id: 3,
      name: 'Cancel'
    }
  ];
  selected = 0;
  id = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<SprintCloseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;
  }
  radioChange(state: any): void{
    this.selected = state;
  }
  cancel(event: any): void{
    this.dialogRef.close({});
  }
  change(event: any): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Sprint/CloseSprint', {
      sprintId: this.id,
      closeStatus: this.selected,
      closedById: this.authService.userId,
      closedOnDate: moment().utc().format()
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
