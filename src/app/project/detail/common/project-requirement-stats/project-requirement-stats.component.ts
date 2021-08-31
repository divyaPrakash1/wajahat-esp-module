import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isEmpty } from 'lodash';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
import { ProjectDetailService } from '../../detail.service';

@Component({
  selector: 'app-project-requirement-stats',
  templateUrl: './project-requirement-stats.component.html',
  styleUrls: ['./project-requirement-stats.component.scss']
})
export class ProjectRequirementStatsComponent implements OnInit {
  @Input() entityid: any;
  @Input() ownerId: any;
  @Output() update = new EventEmitter<any>();

  loading = false;
  isManager = false;
  requirement: any = {};
  projectDetail: any = {};
  total: 0;

  constructor(
    private detailService: ProjectDetailService,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.projectDetail = d;
        this.total = d.requirementCount;
      }
    });
  }

  ngOnInit(): void {
    this.getRequirement();
    this.isManager = this.authService.isAdmin || this.ownerId === this.authService.userId;
  }
  getRequirement(): void{
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.http.post(environment.baseURL + '/api/Requirements/GetRequirementDashboardStatistics?projectId='+this.projectDetail.projectId, {}).subscribe((results: any) => {
      this.requirement = results.result;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

}
