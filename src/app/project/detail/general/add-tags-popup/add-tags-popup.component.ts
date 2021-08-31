import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

export interface DialogData {
  list: Array<any>;
  projectid: number;
  module: string;
}

@Component({
  selector: 'app-add-tags-popup',
  templateUrl: './add-tags-popup.component.html',
  styleUrls: ['./add-tags-popup.component.scss']
})
export class AddTagsPopupComponent implements OnInit {
  list: Array<any> = [];
  projectId = 0;
  module: string;
  loading = false;
  tag = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<AddTagsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.module = this.data.module;
    this.projectId = this.data.projectid;
    this.list = this.data.list;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  onSubmit(): void{
    if (this.tag.value){
      this.loading = true;
      const data = {
        text: this.tag.value,
        color: '#000000',
        entityId: this.projectId,
        createdOn: moment().utc().format(),
        userId: this.authService.userId,
        organizationId: this.authService.organizationId,
        module: this.module
      };
      this.http.post(environment.baseURL + '/api/Tag/AddTagToSystem', data).subscribe((results: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      });
    }
  }

}
