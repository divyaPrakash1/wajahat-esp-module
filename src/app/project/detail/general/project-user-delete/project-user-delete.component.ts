import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  user: any;
}

@Component({
  selector: 'app-project-user-delete',
  templateUrl: './project-user-delete.component.html',
  styleUrls: ['./project-user-delete.component.scss']
})
export class ProjectUserDeleteComponent implements OnInit {
  user: any;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<ProjectUserDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.user = this.data.user;
  }
  cancel(): void{
    this.dialogRef.close();
  }
  change(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/ProjectShare/DeleteSharedUserFromProject', {
      projectShareId: [this.user.projectShareId]
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
