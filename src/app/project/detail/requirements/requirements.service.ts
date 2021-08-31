import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, throwError } from 'rxjs';
import * as moment from 'moment';
import { isEmpty } from 'lodash';
import { AuthService } from 'src/app/shared/services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class ProjectRequirementsService {
  // Observable string sources
  private requirements = new BehaviorSubject<any>({});
  private detail = new BehaviorSubject<any>({});
  private backlogList = new BehaviorSubject<any>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ){
    // constructor
  }

  get getRequirements(): any{
    return this.requirements.asObservable();
  }

  // Service message commands GetProjectById?ProjectId=3
  syncRequirements(args: any): void{
    this.requirements.next({});
    this.http.post(environment.baseURL + '/api/Requirements/GetAllRequirements', {
      projectId: args.projectId,
      isFilterApplied: isEmpty(args.filter) ? false : true,
      filterObject: args.filter,
      search: args.searchKey,
      pageNum: args.pageNumber,
      pageSize: args.pageSize,
      viewGroupType: args.type,
      applyExtrafilterObject: args.extraTypeId === 0 ? false : true,
      extrafilterObject: {
        priority: args.type === 3 ? args.extraTypeId : 0,
        state:  args.type === 2 ? args.extraTypeId : 0
      },
    }).subscribe((results: any) => {
      let result: any = results.result;
      if (args.type === 0){
        result = result.map((r: any) => {
          r.stateName = r.isClosed ? 'Completed' : (r.isCancelled ? 'Cancel' : (r.state === 2 ? 'In Progress' : 'Open' ) );
          r.colorCode = r.stateName === 'Completed' ? '6cb33f' : (r.stateName === 'Cancel' ? 'e21b24' : '1da9e7');
          r.priorityName = r.priority === 4 ? 'Critical' : (r.priority === 3 ? 'High' : (r.priority === 2 ? 'Medium' : 'Low'));
          r.signedByMe = r.signedByUsers ? r.signedByUsers.some((s: any) => s === this.authService.userId) : false;
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
      }
      this.requirements.next(result);

    }, error => {
      console.log(error);
      this.requirements.error(error);
    });
  }

  get getDetail(): any{
    return this.detail.asObservable();
  }
  // Service message commands GetProjectById?ProjectId=3
  syncDetail(id: any): void{
    this.http.get(environment.baseURL + '/api/Requirements/GetRequirement?RequirementId=' + id).subscribe((results: any) => {
      const detail = results.result;
      detail.describeValue = (detail.description === '' || detail.description === null) ? '' : detail.description;
      detail.start_date = moment.utc(detail.startDate).local().format('DD MMM YYYY');
      detail.end_date = detail.endDate ? moment.utc(detail.endDate).local().format('DD MMM YYYY') : '--';
      detail.created_on = detail.createdOnDate ? moment.utc(detail.createdOnDate).local().format('DD MMM YYYY') : '--';
      detail.created_by = detail.createdByName ? detail.createdByName : '--';
      detail.modified_on = detail.lastModifiedDate ? moment.utc(detail.lastModifiedDate).local().format('DD MMM YYYY') : '--';
      detail.modified_by = detail.lastModifiedBy ? detail.lastModifiedBy : '--';
      detail.deliverablePercentage = detail.deliverablePercentage.replace('%', '');
      detail.signatureList = [];

      detail.deliverables = detail.deliverables.map((r: any) => {
        const statusName = r.isCancelled ? 'cancelled' : (r.isCompleted ? 'completed' : 'planned');
        r.title = 'DV' + r.deliverableId;
        r.statusName = statusName;
        r.statusColor = statusName === 'cancelled' ? 'e21b24' : (statusName === 'completed' ? '6cb33f' : '97a3a9');
        r.isFlaged = false;
        return r;
      });

      // detail.last_signed = detail.lastSignedDate ? moment.utc(detail.lastSignedDate).local().format('DD MMM YYYY') : '--';
      // detail.platform = detail.projectPlatforms ? detail.projectPlatforms.map((platform: any, index: any) => {
      //   return (index === 0 ? '' : ' ') +  platform.platformName;
      // }) : '--';
      // detail.stages = detail.projectStages ? detail.projectStages.map((stage: any, index: any) => {
      //   return (index === 0 ? '' : ' ') +  stage.stageName;
      // }) : '--';
      // detail.cost_percentage = Math.round(((detail.cost / detail.revenue) * 100) || 0);
      // detail.planned_cost_percentage = Math.round(((detail.plannedCost / detail.plannedRevenue) * 100) || 0);
      // detail.actual_cost_percentage = Math.round(((detail.actualCost / detail.actualRevenue) * 100) || 0);
      // detail.signedByMe = detail.signedByUsers.some((s: any) => s === this.authService.userId);
      // detail.lastSignedBy = detail.lastSignedBy ? detail.lastSignedBy : '--';

      this.detail.next(detail);
    }, error => {
      console.log(error);
      this.detail.error(error);
    });
  }


  get getBacklog(): any{
    return this.backlogList.asObservable();
  }
  // Service message commands GetProjectById?ProjectId=3
  syncBacklog(args: any): void{
    this.http.post(environment.baseURL + '/api/Requirements/GetBacklogDeliverables', args).subscribe((results: any) => {
      let result: any = results.result;
      result = result.map((r: any) => {
        r.title = 'DV' + r.deliverableId;
        r.statusName = r.deliverableStatus;
        r.statusColor = r.deliverableStatus === 'Missed' ? 'e21b24' : (r.deliverableStatus === 'Done' ? '6cb33f' : '97a3a9');
        r.isFlaged = false;
        return r;
      });
      this.backlogList.next(result);
    }, error => {
      console.log(error);
      this.backlogList.error(error);
    });
  }
}
