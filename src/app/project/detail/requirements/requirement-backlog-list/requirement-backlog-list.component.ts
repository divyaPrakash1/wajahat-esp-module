import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isArray, isEmpty } from 'lodash';
import { DeliverableCommitComponent } from '../deliverable-commit/deliverable-commit.component';
import { ProjectRequirementsService } from '../requirements.service';

@Component({
  selector: 'app-requirement-backlog-list',
  templateUrl: './requirement-backlog-list.component.html',
  styleUrls: ['./requirement-backlog-list.component.scss']
})
export class RequirementBacklogListComponent implements OnInit, OnDestroy {
  @Input() project: any;
  @Input() searchKey: any;

  loading = true;
  list: Array<any> = [];
  pageLoading = false;
  pageNumber = 0;
  pageSize = 20;
  pageInprogress = false;
  nextPageAvailable = true;
  firstTime = true;

  constructor(
    private http: HttpClient,
    private requirementService: ProjectRequirementsService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getAllBacklog();

    this.requirementService.getBacklog.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.loading = false;
        this.pageLoading = false;
        this.pageInprogress = false;
        this.firstTime = false;

        if (this.pageNumber > 0){
          this.list = this.list.concat(d);
        }
        else{
          this.list = d;
        }
      }
      if (isArray(d) && isEmpty(d) && this.pageInprogress && !this.firstTime){
        this.nextPageAvailable = false;
        this.loading = false;
        this.pageInprogress = false;
        this.pageLoading = false;
      }
    }, (e: any) => {
      this.loading = false;
    });
  }
  ngOnDestroy(): void{
    this.list = [];
    this.loading = true;
  }
  getAllBacklog(): void{
    this.pageInprogress = true;
    if (this.pageNumber === 0){
      this.loading = true;
      this.list = [];
    }
    else{
      this.pageLoading = true;
    }
    this.requirementService.syncBacklog({
      projectId: this.project,
      search: this.searchKey,
      pageNum: this.pageNumber,
      pageSize: this.pageSize
    });
  }
  onCommit(selected: any): void{
    const deleteDialog = this.dialog.open(DeliverableCommitComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {
        id: selected.deliverableId,
        projectId: this.project,
      }
    });
    deleteDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.pageNumber = 0;
        this.getAllBacklog();
      }
    });
  }


  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void{
    console.log(
      (window.innerHeight + window.scrollY + 164) >= document.body.offsetHeight
      , this.firstTime , this.pageInprogress, this.nextPageAvailable);
    if ((window.innerHeight + window.scrollY + 164) >= document.body.offsetHeight && !this.firstTime &&
      !this.pageInprogress && this.nextPageAvailable
    ) {
      // you're at the bottom of the page
      this.pageNumber++;
      this.getAllBacklog();
    }
  }
}
