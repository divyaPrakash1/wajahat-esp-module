import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  id: number;
}
@Component({
  selector: 'app-deliverable-reopen',
  templateUrl: './deliverable-reopen.component.html',
  styleUrls: ['./deliverable-reopen.component.scss']
})
export class DeliverableReopenComponent implements OnInit {
  id = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<DeliverableReopenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '​/api/Deliverables/ReopenDeliverable', {
      deliverableId: this.id,
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while compeleting deliverable', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }
}
