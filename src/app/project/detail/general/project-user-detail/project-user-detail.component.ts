import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  projectid: number;
  user: any;
}

@Component({
  selector: 'app-project-user-detail',
  templateUrl: './project-user-detail.component.html',
  styleUrls: ['./project-user-detail.component.scss']
})
export class ProjectUserDetailComponent implements OnInit {
  user: any;

  constructor(
    public dialogRef: MatDialogRef<ProjectUserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.user = this.data.user;
    console.log(this.user);
  }

  ngOnInit(): void {
  }
  onCancel(): void{
    this.dialogRef.close({});
  }
  onDeleteUser(): void{
    this.dialogRef.close({
      action: 'delete',
      user: this.user
    });
  }
  onEditUser(): void{
    this.dialogRef.close({
      action: 'edit',
      user: this.user
    });
  }

}
