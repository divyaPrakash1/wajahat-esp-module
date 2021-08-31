import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequirementClosePopupComponent } from '../requirement-close-popup/requirement-close-popup.component';
import { RequirementDeletePopupComponent } from '../requirement-delete-popup/requirement-delete-popup.component';
import { RequirementRevokePopupComponent } from '../requirement-revoke-popup/requirement-revoke-popup.component';
import { RequirementSignPopupComponent } from '../requirement-sign-popup/requirement-sign-popup.component';
import { RequirementStateChangeComponent } from '../requirement-state-change/requirement-state-change.component';
import { ProjectRequirementsService } from '../requirements.service';

@Component({
  selector: 'app-requirement-gird-view',
  templateUrl: './requirement-gird-view.component.html',
  styleUrls: ['./requirement-gird-view.component.scss']
})
export class RequirementGirdViewComponent implements OnInit, OnChanges {
  @Input() list: any;
  @Output() refresh = new EventEmitter<any>();
  @Output() onexpend = new EventEmitter<any>();
  @Output() onedit = new EventEmitter<any>();

  expended = 0;
  selected: any = {};

  constructor(
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private requirementService: ProjectRequirementsService,
  ) { }

  ngOnInit(): void {
    console.log(this.list);
  }
  ngOnChanges(): void {
    console.log(this.list);
    if(this.expended !== 0){
      this.selected = this.list.find((r: any) => r.requirementId === this.expended);
    }
  }
  OnExpend(id: any): void{
    this.selected = this.list.find((r: any) => r.requirementId === id);
    this.expended = this.expended === id ? 0 : id;
    this.onexpend.emit(this.expended);
  }
  onStateClick(): void{
    const stateDialog = this.dialog.open(RequirementStateChangeComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        requirementId: this.selected.requirementId,
        state: this.selected.state
      }
    });
    stateDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.refresh.emit();
        this.requirementService.syncDetail(this.expended);
      }
    });
  }
  onSignClick(): void{
    const signDialog = this.dialog.open(RequirementSignPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        requirementId: this.selected.requirementId
      }
    });
    signDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.refresh.emit();
        this.requirementService.syncDetail(this.expended);
      }
    });
  }
  onRevokeClick(): void{
    const revokeDialog = this.dialog.open(RequirementRevokePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        requirementId: this.selected.requirementId
      }
    });
    revokeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.refresh.emit();
        this.requirementService.syncDetail(this.expended);
      }
    });
  }
  onCloseClick(): void{
    const closeDialog = this.dialog.open(RequirementClosePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        requirementId: this.selected.requirementId
      }
    });
    closeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.refresh.emit();
        this.requirementService.syncDetail(this.expended);
      }
    });
  }
  onDeleteClick(): void{
    const dialogRef = this.dialog.open(RequirementDeletePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        requirementId: this.selected.requirementId
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.reload){
        this.OnExpend(this.selected.requirementId);
        this.refresh.emit();
      }
    });
  }
  onEditClick(selected: any): void{
    this.onedit.emit(selected);
  }

}
