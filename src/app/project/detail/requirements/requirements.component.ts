import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import { ProjectDetailService } from '../detail.service';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {
  loading = true;
  projectID = 0;
  projectDetail: any = {};
  viewType = 'normal';
  searchKey = '';

  requirements: any = [];
  createRequirement = false;
  time = new Date().getTime();
  selected: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private detailService: ProjectDetailService
  ) {
    const params = this.activatedRoute.snapshot.params;
    this.projectID = params.id;

    router.events.subscribe((val: any) => {
      if (val instanceof NavigationEnd){
        this.viewType = val.url.includes('/advance') ? 'advance' : 'normal';
      }
    });
  }

  ngOnInit(): void {
    this.detailService.syncDetail(this.projectID);
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.projectDetail = d;
      }
    });
    this.getRequirementList();
  }
  switchAdvanceView(): void {
    const currentUrl = 'project/' + this.projectID + '/requirements';
    this.router.navigate([this.viewType === 'advance' ? currentUrl : currentUrl + '/advance']);
  }

  getRequirementList(): void {
    this.loading = false;
    // this.http.post(environment.baseURL + '/api/Requirements/GetAllRequirements', {
    //   projectId: this.projectID,
    //   isFilterApplied: true,
    //   filterObject: {},
    //   search: '',
    //   pageNum: 0,
    //   pageSize: 30
    // }).subscribe((results: any) => {
    //   let result: any = results.result;
    //   this.loading = false;
    //   result = result.map((r: any) => {
    //     const platformPercentage: any = [];
    //     const deliverableList: any = [];
    //     if (r.deliverables){
    //       r.deliverables.map((d: any) => {
    //         const found = platformPercentage.findIndex((p: any) => p.platformId == d.platformId);
    //         if (found >= 0){
    //           platformPercentage[found].percentage += d.percentage;
    //         }
    //         else{
    //           platformPercentage.push({
    //             platformId: d.platformId,
    //             platform: d.platformName,
    //             percentage: d.percentage
    //           });
    //         }

    //         const df = deliverableList.findIndex((dl: any) => dl.stageId == d.stageId);
    //         if (df >= 0){
    //           deliverableList[df].platforms.push({
    //             platformId: d.platformId,
    //             platformName: d.platformName,
    //             percentage: d.percentage
    //           });
    //         }
    //         else{
    //           deliverableList.push({
    //             stageId: d.stageId,
    //             stageName: d.stageName,
    //             planned: d.plannedStatus,
    //             isCompleted: d.isCompleted,
    //             actual: d.actualStatus,
    //             platforms: [
    //               {
    //                 platformId: d.platformId,
    //                 platformName: d.platformName,
    //                 percentage: d.percentage
    //               }
    //             ]
    //           });
    //         }
    //       });
    //     }
    //     r.platformPercentage = platformPercentage;
    //     r.deliverableList = deliverableList;
    //     return r;
    //   });
    //   this.requirements = result;

    // }, error => {
    //   console.log(error);
    // });
  }
  getPlatformPercentage(requirementId: number, platformId: number): string {
    const found = this.requirements.find((r: any) => r.requirementId == requirementId);
    if (found){
      const platform = found.platformPercentage.find((p: any) => p.platform == platformId);
      return platform ? platform.percentage.toFixed(1) + '%' : '--';
    }
    return '--';
  }
  getDeliverablePlatformPercentage(requirementId: number, stageId: number, platformId: number): string {
    const found = this.requirements.find((r: any) => r.requirementId == requirementId);
    const result = '--';
    if (found){
      const foundDel = found.deliverableList.find((d: any) => d.stageId == stageId);
      if (foundDel){
        const platform = foundDel.platforms.find((p: any) => p.platformName == platformId);
        return platform ? platform.percentage.toFixed(1) + '%' : '--';
      }
    }
    return result;
  }
  onKeyUp(event: any): void{
    const target = event.target;
    this.searchKey = target.value;
  }

  onAddRequirement(): void{
    this.selected = {};
    this.createRequirement = true;
  }
  onEditRequirement(requirement: any): void{
    console.log(requirement);
    this.selected = requirement;
    this.createRequirement = true;
  }
  onCloseRequirement(): void{
    this.createRequirement = false;
    this.requirements = [];
    this.loading = true;
    this.getRequirementList();
    this.time = new Date().getTime();
  }
  onArrowClick(e: any): void{
    let target = e.target;
    while (target && target.parentNode) {
      target = target.parentNode;
      if (target && target.className && target.className.includes('accordion-row')) {
        target.classList.toggle('active');
      }
    }
  }
}
