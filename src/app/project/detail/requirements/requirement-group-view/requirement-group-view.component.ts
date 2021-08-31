import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isArray, isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import { ProjectRequirementsService } from '../requirements.service';

@Component({
  selector: 'app-requirement-group-view',
  templateUrl: './requirement-group-view.component.html',
  styleUrls: ['./requirement-group-view.component.scss']
})
export class RequirementGroupViewComponent implements OnInit {
  @Input() list: any;
  @Input() groups: any;
  @Input() type: any;
  @Input() projectId: any;
  @Input() searchKey: any;
  @Output() refresh = new EventEmitter<any>();

  listingLoading = true;
  pageNumber = 0;
  pageSize = 200;
  pageInprogress = false;
  nextPageAvailable = true;
  firstTime = true;
  activeGroupId = 0;
  requirementList = [];
  filter = {};


  constructor(
    private http: HttpClient,
    private requirementService: ProjectRequirementsService,
  ) {
  }

  ngOnInit(): void {
    console.log(this);
  }
  getGroupRequirements(): void{
    this.listingLoading = true;
    this.http.post(environment.baseURL + '/api/Requirements/GetAllRequirements', {
      projectId: this.projectId,
      isFilterApplied: false,
      filterObject: this.filter,
      search: this.searchKey,
      pageNum: this.pageNumber,
      pageSize: this.pageSize,
      viewGroupType: this.type,
      applyExtrafilterObject: this.activeGroupId === 0 ? false : true,
      extrafilterObject: {
        priority: this.type === 'Priority' ? this.activeGroupId : 0,
        state:  this.type === 'State' ? this.activeGroupId : 0
      },
    }).subscribe((results: any) => {
      let result: any = results.result;
      result = result.map((r: any) => {
        r.stateName = r.state === 3 ? 'Closed' : (r.state === 2 ? 'In Progress' : 'Open' );
        r.colorCode = '1da9e7';
        r.priorityName = r.priority === 4 ? 'Critical' : (r.priority === 3 ? 'High' : (r.priority === 2 ? 'Medium' : 'Low'));
        const platformPercentage: any = [];
        const deliverableList: any = [];
        if (r.deliverables){
          r.deliverables.map((d: any) => {
            const found = platformPercentage.findIndex((p: any) => p.platformId === d.platformId);
            if (found >= 0){
              platformPercentage[found].percentage += d.percentage;
            }
            else{
              platformPercentage.push({
                platformId: d.platformId,
                platform: d.platformName,
                percentage: d.percentage
              });
            }

            const df = deliverableList.findIndex((dl: any) => dl.stageId == d.stageId);
            if (df >= 0){
              deliverableList[df].platforms.push({
                platformId: d.platformId,
                platformName: d.platformName,
                percentage: d.percentage
              });
            }
            else{
              deliverableList.push({
                stageId: d.stageId,
                stageName: d.stageName,
                planned: d.plannedStatus,
                isCompleted: d.isCompleted,
                actual: d.actualStatus,
                platforms: [
                  {
                    platformId: d.platformId,
                    platformName: d.platformName,
                    percentage: d.percentage
                  }
                ]
              });
            }
          });
        }
        r.platformPercentage = platformPercentage;
        r.deliverableList = deliverableList;
        return r;
      });
      this.requirementList = result;
      this.listingLoading = false;

    }, error => {
      console.log(error);
      this.listingLoading = false;
    });
  }
  onGroupClick(group: any): void{
    if(this.activeGroupId === group.id){
      this.activeGroupId = 0;
    }
    else{
      this.activeGroupId = group.id;
      this.getGroupRequirements();
    }
  }
}
