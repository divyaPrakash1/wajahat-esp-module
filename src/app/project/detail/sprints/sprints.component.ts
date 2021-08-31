import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SprintAddComponent } from './sprint-add/sprint-add.component';
import * as moment from 'moment';

@Component({
  selector: 'app-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsComponent implements OnInit {
  projectID = 0;
  loading = false;
  time = new Date().getTime();
  dashboardLoading = true;
  dashboardStats: any = {};
  showAddButton = true;
  queryparams: any;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ){
    this.queryparams = this.activatedRoute.snapshot.queryParams;

    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    console.log(urlTree.toString());
    const last: any = urlTree.toString().split('/');
    last.forEach((element: any, index: number) => {
      console.log(element);
      if (element === 'sprints'){
        this.projectID = last[index - 1];
      }
    });
    console.log(this.queryparams);
    if (this.queryparams.model && this.queryparams.model === 'create'){
      setTimeout(() => {
        this.onAddClick();
      }, 300);
    }
  }

  ngOnInit(): void {
    this.dashboardData();
  }
  dashboardData(): void{
    this.dashboardLoading = true;
    this.http.post(environment.baseURL + '/api/Sprint/GetSprintDashboard', {
      projectId: this.projectID,
      currentDateTime: moment().utc().format()
    }).subscribe({
      next: (result: any) => {
        this.dashboardLoading = false;
        this.dashboardStats = result.result;
        this.dashboardStats.lastSignedDate = moment(this.dashboardStats.lastSignedDate).local().format('DD MMM YYYY');
      },
      error: (err: any) => {
        this.dashboardLoading = false;
        this.dashboardStats = false;
      }
    });
  }
  onAddClick(): void{
    const AddPopupRef = this.dialog.open(SprintAddComponent, {
      disableClose: true,
      panelClass: 'sprint-add-dailog',
      data: {
        projectid: this.projectID,
      }
    });
    AddPopupRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        this.loading = false;
        this.time = new Date().getTime();
        this.dashboardData();
      }
    });
  }
  onExpend(id: any): void{
    this.showAddButton = false;
    if (id === 0){
      this.showAddButton = true;
    }
  }
}
