import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  id: number;
}
@Component({
  selector: 'app-sprint-delete',
  templateUrl: './sprint-delete.component.html',
  styleUrls: ['./sprint-delete.component.scss']
})
export class SprintDeleteComponent implements OnInit {
  id = 0;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<SprintDeleteComponent>,
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
    this.http.post(environment.baseURL + '/api/Sprint/DeleteSprint?SprintId=1', {}).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while deleting Sprint', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
