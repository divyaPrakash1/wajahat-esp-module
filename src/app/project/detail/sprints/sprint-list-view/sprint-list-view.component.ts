import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SprintCloseRequestComponent } from '../sprint-close-request/sprint-close-request.component';
import { SprintCloseComponent } from '../sprint-close/sprint-close.component';
import { SprintDeleteComponent } from '../sprint-delete/sprint-delete.component';
import { SprintRevokeComponent } from '../sprint-revoke/sprint-revoke.component';
import { SprintSignComponent } from '../sprint-sign/sprint-sign.component';

@Component({
  selector: 'app-sprint-list-view',
  templateUrl: './sprint-list-view.component.html',
  styleUrls: ['./sprint-list-view.component.scss']
})
export class SprintListViewComponent implements OnInit {
  @Input() list: any = [];
  @Input() projectid: any;
  @Output() onexpend = new EventEmitter<any>();
  expended = 0;
  selected: any = {};

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    console.log(this.list);
  }
  OnExpend(id: any): void{
    this.selected = this.list.find((r: any) => r.sprintId === id);
    this.expended = this.expended === id ? 0 : id;
  }
  onSign(selected: any): void{
    const signDialog = this.dialog.open(SprintSignComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.sprintId
      }
    });
    signDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.onexpend.emit(0);
      }
    });
  }
  onRevoke(selected: any): void{
    const revokeDialog = this.dialog.open(SprintRevokeComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.sprintId
      }
    });
    revokeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.onexpend.emit(0);
      }
    });
  }
  onCloseRequest(selected: any): void{
    const closeDialog = this.dialog.open(SprintCloseRequestComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        selected
      }
    });
    closeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.onexpend.emit(0);
      }
    });
  }
  onClose(selected: any): void{
    const closeDialog = this.dialog.open(SprintCloseComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.sprintId
      }
    });
    closeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.onexpend.emit(0);
      }
    });
  }
  onDelete(selected: any): void{
    const deleteDialog = this.dialog.open(SprintDeleteComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.sprintId
      }
    });
    deleteDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.onexpend.emit(0);
      }
    });
  }

}
