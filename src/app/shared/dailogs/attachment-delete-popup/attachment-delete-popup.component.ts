import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  attachment: any;
}

@Component({
  selector: 'app-attachment-delete-popup',
  templateUrl: './attachment-delete-popup.component.html',
  styleUrls: ['./attachment-delete-popup.component.scss']
})
export class AttachmentDeletePopupComponent implements OnInit {
  attachment: any;
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<AttachmentDeletePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.attachment = this.data.attachment;
  }
  cancel(event: any): void{
    this.dialogRef.close({});
  }
  change(event: any): void{
    this.loading = true;
    const guid = this.attachment.fileUniqueKey;
    if (guid){
      this.http.delete(environment.file.api + '/api/file/delete?id=' + guid, {
        responseType: 'text'
      }).subscribe({
        next: (file: any) => {
          this.http.delete(environment.baseURL + '/api/File/DeleteFile?fileId=' + this.attachment.fileId).subscribe({
            next: (result: any) => {
              this.loading = false;
              this.dialogRef.close({reload: true});
            },
            error: (err: any) => {
              this.loading = false;
              this.snackbar.open(err.message || 'Error occured while deleting project', '', {
                duration: 3000,
                horizontalPosition: 'start',
              });
            }
          });
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while deleting project', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
  }
}
