import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  id: number;
  sprint: number | any;
}
@Component({
  selector: 'app-deliverable-remove',
  templateUrl: './deliverable-remove.component.html',
  styleUrls: ['./deliverable-remove.component.scss']
})
export class DeliverableRemoveComponent implements OnInit {
  id = 0;
  sprint = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<DeliverableRemoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;
    this.sprint = this.data.sprint;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Sprint/RemoveDeliverablesFromSprint', {
      deliverableIds: [this.id],
      sprintId: this.sprint,
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while removing deliverable', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }
}
