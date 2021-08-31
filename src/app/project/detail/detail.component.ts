import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {filter} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProjectDetailService } from './detail.service';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  tabs: Array<any> = [
    {
      name: 'General',
      link: 'general'
    },
    {
      name: 'Detail',
      link: 'detail'
    },
    {
      name: 'Risks',
      link: 'risks'
    },
    {
      name: 'Issues',
      link: 'issues'
    },
    {
      name: 'Requests',
      link: 'requests'
    },
    {
      name: 'Activities',
      link: 'activities'
    },
    {
      name: 'History',
      link: 'history'
    },
    {
      name: 'Sprints',
      link: 'sprints'
    }
  ];
  activeTab = 'detail';
  activeTabName = 'Detail';

  projectID = 0;
  projectLoading = true;
  projectDetail: any = {};

  activeBreadcrums = [
    {
      text: 'Projects',
      link: '/project/list',
      isActive: false
    }
  ];
  currentURL = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private detailService: ProjectDetailService
  ){
    const params = this.activatedRoute.snapshot.params;
    this.projectID = params.id;

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      let last: any = event.url.split('/');
      this.currentURL = event.url;
      let first = true;
      last.forEach((element: any, index: number) => {
        if (element === this.projectID && first){
          last = last[index + 1];
          first = false;
        }
      });
      if (last === undefined){
        last = 'detail';
      }
      if (last && typeof last === 'string' && this.activeTab !== last){
        this.activeTab = last;
        const link = this.tabs.find(t => t.link === last);
        this.activeTabName = link ? link.name : '';
      }
      this.syncBreadcrumbs();
    });
  }
  ngOnInit(): void {
    this.detailService.syncDetail(this.projectID);
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.projectLoading = false;
        this.projectDetail = d;
      }
    }, (e: any) => {
      this.projectLoading = false;
    });
  }
  ngOnDestroy(): void{
    this.detailService.removeDetail();
  }
  syncBreadcrumbs(): void{
    this.activeBreadcrums = [
      {
        text: 'Projects',
        link: '/project/list',
        isActive: false
      }
    ];
    console.log(this.activeTab);
    if (this.activeTab === 'detail'){
      this.activeBreadcrums.push({
        text: 'Project Dashboard',
        link: '/project/' + this.projectID,
        isActive: true
      });
    }
    else if (this.activeTab === 'general'){
      this.activeBreadcrums.push({
        text: 'Project Dashboard',
        link: '/project/' + this.projectID,
        isActive: false
      });
      this.activeBreadcrums.push({
        text: 'Project Detail',
        link: '/project/' + this.projectID + '/general',
        isActive: true
      });
    }
    else if (this.activeTab === 'sprints'){
      this.activeBreadcrums.push({
        text: 'Project Dashboard',
        link: '/project/' + this.projectID,
        isActive: false
      });
      this.activeBreadcrums.push({
        text: 'Sprints',
        link: '/project/' + this.projectID + '/sprints',
        isActive: true
      });
    }
    else if (this.activeTab === 'activities'){
      this.activeBreadcrums.push({
        text: 'Project Dashboard',
        link: '/project/' + this.projectID,
        isActive: false
      });
      if (this.currentURL.includes('activities/details')){
        this.activeBreadcrums.push({
          text: 'Activities',
          link: '/project/' + this.projectID + '/activities/' + this.projectID,
          isActive: false
        });
        this.activeBreadcrums.push({
          text: 'Activity Detail',
          link: '/project/' + this.projectID + '/activities/' + this.projectID,
          isActive: true
        });
      }
      else{
        this.activeBreadcrums.push({
          text: 'Activities',
          link: '/project/' + this.projectID + '/activities/' + this.projectID,
          isActive: true
        });
      }
    }
  }
}
