import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray, isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import { ProjectDetailService } from '../../detail.service';
import { ProjectRequirementsService } from '../requirements.service';

@Component({
  selector: 'app-requirement-normal-view',
  templateUrl: './requirement-normal-view.component.html',
  styleUrls: ['./requirement-normal-view.component.scss']
})
export class RequirementNormalViewComponent implements OnInit {
  @Input() searchKey: string;
  @Input() time: any;
  @Output() addClick = new EventEmitter<string>();
  @Output() onedit = new EventEmitter<string>();

  loading = true;
  pageLoading = false;
  projectDetail: any = {};
  projectID = 0;
  isBacklog = false;
  activeStyle = 'gird';
  listView = 'Default';
  labelList: Array<any> = [];
  labelFilter = new FormControl([]);
  requirementList: Array<any> = [];
  timer: any = false;
  pageNumber = 0;
  pageSize = 10;
  pageInprogress = false;
  nextPageAvailable = true;
  firstTime = true;
  groupList = [];
  activeGroupId = 0;
  onExpend = 0;
  showAddButton = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private detailService: ProjectDetailService,
    private requirementService: ProjectRequirementsService,
  ) {
    const params = this.activatedRoute.snapshot.params;
    this.projectID = params.id;
    this.getLabels();
    this.getAllRequirements();
  }

  ngOnInit(): void {
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.projectDetail = d;
      }
    });
    this.requirementService.getRequirements.subscribe((d: any) => {
      console.log(isArray(d), isEmpty(d), !this.firstTime);
      if (!isEmpty(d)){
        if (this.listView === 'Default'){
          if (this.pageNumber > 0){
            this.requirementList = this.requirementList.concat(d);
          }
          else{
            this.requirementList = d;
          }
        }
        else{
          if (this.pageNumber > 0){
            this.groupList = this.groupList.concat(d);
          }
          else{
            this.groupList = d;
          }
        }
        this.pageLoading = false;
        this.firstTime = false;
        this.pageInprogress = false;
        this.loading = false;
      }
      if (isArray(d) && isEmpty(d) && !this.firstTime){
        this.nextPageAvailable = false;
        this.loading = false;
        this.pageInprogress = false;
        this.pageLoading = false;
      }
    }, (e: any) => {
      this.loading = false;
    });
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(changes: SimpleChanges): void{
    console.log(changes);
    if (changes.searchKey && changes.searchKey.previousValue !== changes.searchKey.currentValue && !changes.searchKey.firstChange){
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.pageNumber = 0;
        this.getAllRequirements();
        this.showAddButton = true;
      }, 1000);
    }
    if (changes.time && changes.time.previousValue !== changes.time.currentValue){
      this.showAddButton = true;
      this.pageNumber = 0;
      this.getAllRequirements();
    }
  }
  getAllRequirements(): void{
    this.pageInprogress = true;
    if (this.pageNumber === 0){
      this.loading = true;
      this.requirementList = [];
    }
    else{
      this.pageLoading = true;
    }
    this.requirementService.syncRequirements({
      projectId: this.projectID,
      searchKey: this.searchKey,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      isFilterApplied: this.labelFilter.value.length > 0 ? true : false,
      filter: {
        labels: this.labelFilter.value.map((o: any) => o.id)
      },
      type: this.listView === 'Priority' ? 3 : (this.listView === 'State' ? 2 : 0),
      extraTypeId: 0,
    });
  }
  getLabels(): void{
    this.http.get(environment.baseURL + '/api/Tag/GetAllTagsAssociatedInProjectWithReq?module=requirement-categories&ProjectId=' +
    this.projectID).subscribe({
      next: (result: any) => {
        this.labelList = result.result.map((label: any) => {
          return {
            id: label.tagId,
            name: label.tagText,
            value: label.tagId
          };
        });
        this.loading = false;
      }
    });
  }
  onAddRequirementClick(event: any): void{
    this.addClick.emit();
  }
  onBackLogButton(event: any): void{
    if (event === 'true' && !this.isBacklog){
      this.showAddButton = false;
      this.isBacklog = true;
    }
    else if (event === 'false' && this.isBacklog){
      this.showAddButton = true;
      this.isBacklog = false;
    }
  }

  viewChange(s: string): void{
    this.listView = s;
    this.nextPageAvailable = true;
    this.pageNumber = 0;
    this.activeGroupId = 0;
    this.searchKey = '';
    this.groupList = [];
    this.getAllRequirements();
  }
  ViewDisplayByName(s: string): string{
    return s;
  }
  changeStyle(s: string): void{
    if (this.listView === 'Default'){
      this.activeStyle = s;
      // this.pageNumber = 0;
      // this.loadProjectByTab();
    }
  }
  labelSelected(event: any): void{
    console.log(event);
    this.labelFilter.patchValue(event);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.pageNumber = 0;
      this.getAllRequirements();
    }, 1000);
  }
  refreshListing(): void{
    this.requirementService.syncRequirements({
      projectId: this.projectID,
      searchKey: this.searchKey,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      isFilterApplied: this.labelFilter.value.length > 0 ? true : false,
      filter: {
        labels: this.labelFilter.value.map((o: any) => o.id)
      },
      type: this.listView === 'Priority' ? 3 : (this.listView === 'State' ? 2 : 0),
      extraTypeId: 0,
    });
  }
  onGirdExpend(id: any): void{
    this.showAddButton = false;
    this.onExpend = id;
    console.log(id);
    if (id === 0){
      this.showAddButton = true;
    }
  }
  onEditClick(selected: any): void{
    this.onedit.emit(selected);
  }



  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void{
    if ((window.innerHeight + window.scrollY + 164) >= document.body.offsetHeight && !this.firstTime &&
      !this.pageInprogress &&
      this.nextPageAvailable &&
      !this.isBacklog && this.onExpend === 0 &&
      this.listView === 'Default'
    ) {
      // you're at the bottom of the page
      this.pageNumber++;
      this.getAllRequirements();
    }
  }
}
