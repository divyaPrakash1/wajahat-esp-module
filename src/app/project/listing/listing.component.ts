import { HttpClient} from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Options } from '@angular-slider/ngx-slider';
import { DeviceDetectorService } from 'ngx-device-detector';

export interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
})
export class ListingComponent implements OnInit {
  activeTab = 'All';
  activeStyle = 'list';
  listView = 'Default';
  activeGroupId = 0;
  totalProjects = 0;
  totalOpen = 0;
  totalOverdue = 0;
  totalUnhealthy = 0;

  tabs: Array<string> = ['Open', 'All'];
  groupListing: Array<any> = [];
  projectListing: Array<any> = [];

  timer: any = false;
  searchKey = '';
  pageNumber = 0;
  pageSize = 10;
  pageInprogress = false;
  nextPageAvailable = true;
  firstTime = true;

  loading = true;
  listingLoading = true;
  overdueTotal = 0;
  overdueListing: Array<any> = [];

  isFilterOpen = false;
  isFilterApplied = false;
  filterLoading = false;
  tempFilterArray = {
    state: [],
    group: [],
    label: [],
    scope: 0
  };
  ownerList: Array<any> = [];
  ownerFilter = new FormControl([]);
  filteredOptions: Observable<User[]> | undefined;
  statusList: Array<any> = [];
  statusFilter = new FormControl(1);
  typeFilter = new FormControl(0);
  stateList: Array<any> = [];
  stateFilter = new FormControl([]);
  labelList: Array<any> = [];
  labelFilter = new FormControl([]);
  groupList: Array<any> = [];
  groupFilter = new FormControl([]);
  dueDateStartFilter = new FormControl();
  dueDateEndFilter = new FormControl();
  progressFilter = {indexStart: 0, indexEnd: 100};
  satisfactionFilter = {indexStart: 0, indexEnd: 100};
  overallFilter = {indexStart: 0, indexEnd: 100};

  options: Options = {
    floor: 0,
    ceil: 100,
    translate: (value: number): string => {
      return value + '%';
    }
  };

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceDetectorService
  ) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.search){
      this.searchKey = queryParams.search;
    }
    if(this.deviceService.isMobile()){
      this.activeStyle = 'gird';
    }
  }
  ngOnInit(): void {
    this.firstTime = true;

    this.http.post(environment.baseURL + '/api/General/GetAllOptionSetsForAForm',
      {formTypeArray: ['ProjectOwners', 'ProjectStates', 'ProjectStatus', 'Groups', 'Labels']}
    ).subscribe((results: any) => {
      const result: any = results.result;

      const statusList = result.find((r: any) => r.formType === 'ProjectStatus');
      this.statusList = statusList.result;

      const stateList = result.find((r: any) => r.formType === 'ProjectStates');
      this.stateList = stateList.result;

      const ownerList = result.find((r: any) => r.formType === 'ProjectOwners');
      this.ownerList = ownerList.result;

      const groupsList = result.find((r: any) => r.formType === 'Groups');
      this.groupList = groupsList.result;

      const labelsList = result.find((r: any) => r.formType === 'Labels');
      this.labelList = labelsList.result;

      this.loading = false;
      this.loadProjectByTab();
    }, error => {
      console.log(error);
    });

    this.filteredOptions = this.ownerFilter.valueChanges
    .pipe(
      map(value => (typeof value === 'string' || value === null) ? value : value.name),
      map(name => name ? this._filter(name) : this.ownerList.slice())
    );
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }
  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.ownerList.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  loadProjectByTab(): void{
    this.listingLoading = this.pageNumber > 0 ? false : true;
    this.pageInprogress = true;
    console.log(this.ownerFilter.value);
    const data = {
      projectStatusFilterType: this.activeTab === 'overdue' ? 2 : (this.activeTab === 'unhealthy' ? 3 : 0),
      viewGroupType: this.listView === 'Default' ? 0 :
            (this.listView === 'Group' ? 1 :
            (this.listView === 'DueMonth' ? 2 :
            (this.listView === 'ProjectManager' ? 3 : 4))),
      showAll: this.activeTab === 'All' ? true : false,
      isFilterApplied: this.isFilterApplied,
      filterObject: {
        scope: this.typeFilter.value,
        projectGroupIds: this.groupFilter.value.map((o: any) => o.id),
        labels: this.labelFilter.value.map((o: any) => o.id),
        projectStatus: this.statusFilter.value ? [this.statusFilter.value] : [],
        projectStates: this.stateFilter.value.map((o: any) => o.id),
        projectOwners: this.ownerFilter.value.map((o: any) => o.id),
        dueDateFrom: this.dueDateStartFilter.value ? moment(this.dueDateStartFilter.value).startOf('day').utc().format() : null,
        dueDateTo: this.dueDateEndFilter.value ? moment(this.dueDateEndFilter.value).endOf('day').utc().format() : null,
        progressIndex: {
          indexStart: this.progressFilter.indexStart,
          indexEnd: this.progressFilter.indexEnd
        },
        statisfactionIndex: {
          indexStart: this.satisfactionFilter.indexStart,
          indexEnd: this.satisfactionFilter.indexEnd
        },
        overallIndex: {
          indexStart: this.overallFilter.indexStart,
          indexEnd: this.overallFilter.indexEnd
        },
      },
      applyExtrafilterObject: this.activeGroupId === 0 ? false : true,
      extrafilterObject: {
        projectGroupId: this.listView === 'Group' ? this.activeGroupId : 0,
        projectState: this.listView === 'State' ? this.activeGroupId : 0,
        projectOwner: this.listView === 'ProjectManager' ? this.activeGroupId : 0,
        dueOnMonth: this.listView === 'DueMonth' ? this.activeGroupId : ''
      },
      pageNum: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchKey,
    };
    const url = 'GetProjects';
    this.http.post(environment.baseURL + '/api/Project/' + url, data).subscribe((projects: any) => {
      this.totalProjects = projects.result.totals.totalProjects;
      this.totalOpen = projects.result.totals.totalOpenProjects;
      this.totalOverdue = projects.result.totals.totalOverdueProjects;
      this.totalUnhealthy = projects.result.totals.totalUnHealthyProjects;
      if (this.listView === 'Default' || this.activeGroupId !== 0){
        const list = projects.result.records.map((p: any) => {
          p.startDate = moment.utc(p.startDate).local().format('DD MMM YYYY');
          p.last_signed = p.lastSignedDate ? moment.utc(p.lastSignedDate).local().format('DD MMM YYYY') : '--';
          p.due_date = p.dueDate ? moment.utc(p.dueDate).local().format('DD MMM YYYY') : '--';
          return p;
        });
        if (this.pageNumber > 0){
          this.projectListing = this.projectListing.concat(list);
        }
        else{
          this.projectListing = list;
        }
        if (list.length === 0){
          this.nextPageAvailable = false;
        }
      }
      else{
        if (this.pageNumber > 0){
          this.groupListing = this.groupListing.concat(projects.result.records);
        }
        else{
          this.groupListing = projects.result.records;
        }
        if (projects.result.records.length === 0){
          this.nextPageAvailable = false;
        }
      }

      this.listingLoading = false;
      this.loading = false;
      this.pageInprogress = false;
      this.firstTime = false;
    }, error => {
      this.listingLoading = false;
      this.snackbar.open(error.message || 'Error occured while loading projects', '', {
        duration: 3000,
        horizontalPosition: 'start',
      });
    });
  }
  checkFilter(): void{
    if (
      (this.ownerFilter.value !== null && this.ownerFilter.value !== '' && this.ownerFilter.value.length > 0) ||
      this.stateFilter.value.length > 0 ||
      (this.dueDateStartFilter.value !== '' && this.dueDateStartFilter.value !== null) ||
      (this.dueDateEndFilter.value !== '' && this.dueDateEndFilter.value !== null) ||
      this.progressFilter.indexStart > 0 ||
      this.progressFilter.indexEnd < 100 ||
      this.satisfactionFilter.indexStart > 0 ||
      this.satisfactionFilter.indexEnd < 100 ||
      this.overallFilter.indexStart > 0 ||
      this.overallFilter.indexEnd < 100 ||
      this.typeFilter.value > 0
    ){
      this.isFilterApplied = true;
    }
    else{
      this.isFilterApplied = false;
    }
  }
  tempFilter(event: any, type: string): void{
    console.log(event, type);
    if (type === 'state'){
      this.tempFilterArray.state = event;
    }
    else if (type === 'label'){
      this.tempFilterArray.label = event;
    }
    else if (type === 'group'){
      this.tempFilterArray.group = event;
    }
    else if (type === 'type'){
      this.tempFilterArray.scope = Number(event.value);
    }
  }


  tabchange(event: any, link: string ): void{
    this._resetFilter();
    this.activeTab = link;
    this.pageNumber = 0;
    this.loadProjectByTab();
  }
  onKeyUp(event: any): void{
    const target = event.target;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.searchKey = target.value;
      this.pageNumber = 0;
      this.loadProjectByTab();
    }, 1000);
    console.log(target.value);
  }
  statusSelect(event: any): void{
    if (event.value === ''){
      this.statusFilter.patchValue('');
    }
    this.statusFilter.patchValue(event.value);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.pageNumber = 0;
      this.checkFilter();
      this.loadProjectByTab();
    }, 300);
  }
  ownerSelected(event: any): void{
    console.log(event);
    this.ownerFilter.patchValue(event);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.pageNumber = 0;
      this.checkFilter();
      this.loadProjectByTab();
    }, 200);
  }
  openFilter(event: any): void{
    console.log(event);
    this.isFilterOpen = true;
  }
  closeFilter(event: any): void{
    this.isFilterOpen = false;
    this.tempFilterArray = {
      state: [],
      group: [],
      label: [],
      scope: 0
    };
  }
  resetFilter(event: any): void{
    this._resetFilter();
    this.isFilterOpen = false;
    this.pageNumber = 0;
    this.checkFilter();
    this.loadProjectByTab();
  }
  private _resetFilter(): void{
    this.ownerFilter.patchValue([]);
    this.statusFilter.patchValue(1);
    this.stateFilter.patchValue([]);
    this.dueDateStartFilter.patchValue('');
    this.dueDateEndFilter.patchValue('');
    this.progressFilter = {indexStart: 0, indexEnd: 100};
    this.satisfactionFilter = {indexStart: 0, indexEnd: 100};
    this.overallFilter = {indexStart: 0, indexEnd: 100};
    this.typeFilter.patchValue(0);
    this.labelFilter.patchValue([]);
    this.groupFilter.patchValue([]);
    this.tempFilterArray = {
      state: [],
      group: [],
      label: [],
      scope: 0
    };
  }
  applyFilter(event: any): void{
    this.stateFilter.setValue(this.tempFilterArray.state);
    this.typeFilter.setValue(this.tempFilterArray.scope);
    this.groupFilter.setValue(this.tempFilterArray.group);
    this.labelFilter.setValue(this.tempFilterArray.label);
    this.tempFilterArray = {
      state: [],
      group: [],
      label: [],
      scope: 0
    }
    this.isFilterOpen = false;
    this.pageNumber = 0;
    this.checkFilter();
    this.loadProjectByTab();
  }
  changeStyle(s: string): void{
    if (this.listView === 'Default'){
      this.activeStyle = s;
      this.pageNumber = 0;
      this.loadProjectByTab();
    }
  }
  viewChange(s: string): void{
    this.listView = s;
    this.nextPageAvailable = true;
    this.pageNumber = 0;
    this.activeGroupId = 0;
    this.searchKey = '';
    this.groupList = [];
    this.loadProjectByTab();
  }
  ViewDisplayByName(s: string): string{
    if (s === 'DueMonth'){
      return 'Due Month';
    }
    else if (s === 'ProjectManager'){
      return 'Project Manager';
    }
    return s;
  }
  onGroupClick(group: any): void{
    if (group.id === this.activeGroupId){
      this.activeGroupId = 0;
    }
    else{
      this.projectListing = [];
      this.activeGroupId = group.id;
      this.loadProjectByTab();
    }
  }
  onCardClick(id: any): void{
    if (id){
      this.router.navigate(['project/' + id]);
    }
  }
  onTabChange(event: any): void{
    if (event === this.activeTab){
      this.activeTab = 'All';
    }
    else{
      this.activeTab = event;
    }
    this._resetFilter();
    this.nextPageAvailable = true;
    this.pageNumber = 0;
    this.loadProjectByTab();
  }
  sliderChange(event: any, type: any): void{
    console.log(event, type);
    if (type === 'progress'){
      this.progressFilter = {
        indexEnd: event.highValue,
        indexStart: event.value,
      }
    }
    else if (type === 'satisfaction'){
      this.satisfactionFilter = {
        indexEnd: event.highValue,
        indexStart: event.value,
      }
    }
    else if (type === 'overall'){
      this.overallFilter = {
        indexEnd: event.highValue,
        indexStart: event.value,
      }
    }
  }


  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void{
    if ((window.innerHeight + window.scrollY + 164) >= document.body.offsetHeight && !this.firstTime &&
      !this.pageInprogress &&
      this.nextPageAvailable &&
      this.activeGroupId === 0 &&
      this.listView === 'Default'
    ) {
      // you're at the bottom of the page
      this.pageNumber++;
      this.loadProjectByTab();
    }
  }

}
