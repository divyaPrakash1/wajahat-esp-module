import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isArray, isEmpty } from 'lodash';
import { ProjectSprintsService } from '../sprints.service';
import * as moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-sprint-listing',
  templateUrl: './sprint-listing.component.html',
  styleUrls: ['./sprint-listing.component.scss']
})
export class SprintListingComponent implements OnInit, OnChanges {
  @Input() time = new Date().getTime();
  @Input() projectid = 0;
  @Output() onexpend = new EventEmitter<any>();

  loading = true;
  searchKey = '';
  list = [];
  totalSprints = 0;
  timer: any = false;
  pageNumber = 0;
  pageSize = 10;
  pageInprogress = false;
  nextPageAvailable = true;
  firstTime = true;
  pageLoading = false;

  statusList: Array<any> = [
    {
      id: 0,
      name: 'All'
    },
    {
      id: 1,
      name: 'Current'
    },
    {
      id: 2,
      name: 'Upcoming'
    },
    {
      id: 3,
      name: 'Closed'
    },
    {
      id: 4,
      name: 'PastDue'
    },
  ];
  statusFilter = new FormControl(0);
  activeStyle = 'list';
  showAddButton = true;
  onExpend = 0;

  constructor(
    private SprintsService: ProjectSprintsService,
    private deviceService: DeviceDetectorService,
  ) {
    if(this.deviceService.isMobile()){
      this.activeStyle = 'gird';
    }
  }

  ngOnInit(): void {
    this.SprintsService.getlisting.subscribe((d: any) => {
      console.log(isArray(d), isEmpty(d), !this.firstTime);
      if (!isEmpty(d)){
        if (this.pageNumber > 0){
          this.list = this.list.concat(d);
        }
        else{
          this.list = d;
        }
        console.log(d);
        this.totalSprints = this.list.length;
        this.pageLoading = false;
        this.firstTime = false;
        this.pageInprogress = false;
        this.loading = false;
      }
      else if (isArray(d) && isEmpty(d) && this.firstTime){
        this.loading = false;
      }
      if (isArray(d) && isEmpty(d) && !this.firstTime){
        this.nextPageAvailable = false;
        this.loading = false;
        this.pageInprogress = false;
        this.pageLoading = false;
      }
    }, (e: any) => {
      this.nextPageAvailable = false;
      this.loading = false;
      this.pageInprogress = false;
      this.pageLoading = false;
    });
    this.getAllSprints();
  }
  ngOnChanges(changes: SimpleChanges): void{
    console.log(changes, changes.time.currentValue, this.time);
    if (changes.time){
      this.getAllSprints();
    }
  }
  getAllSprints(): void{
    this.pageInprogress = true;
    if (this.pageNumber === 0){
      this.loading = true;
      this.list = [];
    }
    else{
      this.pageLoading = true;
    }
    const status = this.statusList.find((s: any) => s.id === this.statusFilter.value);
    this.SprintsService.syncListing({
      projectId: this.projectid,
      searchKey: this.searchKey,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filter: {
        sprintStatus: status ? [status.name] : []
      },
      time: moment().utc().format(),
    });
  }
  changeStyle(s: string): void{
    this.activeStyle = s;
    this.pageNumber = 0;
    this.getAllSprints();
  }
  onKeyUp(event: any): void{
    const target = event.target;
    this.searchKey = target.value;
    this.getAllSprints();
  }
  statusSelect(event: any): void{
    if (event.value === ''){
      this.statusFilter.patchValue('');
    }
    this.statusFilter.patchValue(event.value);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.pageNumber = 0;
      this.getAllSprints();
    }, 300);
  }
  onGirdExpend(id: any): void{
    this.showAddButton = false;
    this.onExpend = id;
    this.onexpend.emit(id);
    if (id === 0){
      this.pageNumber = 0;
      this.getAllSprints();
    }
  }


  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void{
    if ((window.innerHeight + window.scrollY + 164) >= document.body.offsetHeight && !this.firstTime &&
      !this.pageInprogress &&
      this.nextPageAvailable
    ) {
      // you're at the bottom of the page
      this.pageNumber++;
      this.getAllSprints();
    }
  }

}
