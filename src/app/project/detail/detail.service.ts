import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, throwError } from 'rxjs';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class ProjectDetailService {
  // Observable string sources
  private detail = new BehaviorSubject<any>({});

  constructor(private http: HttpClient,
              private authService: AuthService
  ){}

  get getDetail(): any{
    return this.detail.asObservable();
  }

  removeDetail(): void{
    this.detail = new BehaviorSubject<any>({});
  }
  // Service message commands GetProjectById?ProjectId=3
  syncDetail(id: number): void{
    this.http.post(environment.baseURL + '/api/Project/GetProjectById', {
      projectId: id,
      currentDate: new Date().toISOString()
    }).subscribe((results: any) => {
      const detail = results.result;
      detail.describeValue = (detail.describeValue === '' || detail.describeValue === null) ? '' : detail.describeValue;
      detail.start_date = moment.utc(detail.startDate).local().format('DD MMM YYYY');
      detail.due_date = detail.dueDate ? moment.utc(detail.dueDate).local().format('DD MMM YYYY') : '--';
      detail.last_signed = detail.lastSignedDate ? moment.utc(detail.lastSignedDate).local().format('DD MMM YYYY') : '--';
      detail.platform = detail.projectPlatforms ? detail.projectPlatforms.map((platform: any, index: any) => {
        return (index === 0 ? '' : ' ') +  platform.platformName;
      }) : '--';
      detail.stages = detail.projectStages ? detail.projectStages.map((stage: any, index: any) => {
        return (index === 0 ? '' : ' ') +  stage.stageName;
      }) : '--';
      detail.cost_percentage = Math.round(((detail.cost / detail.revenue) * 100) || 0);
      detail.planned_cost_percentage = Math.round(((detail.plannedCost / detail.plannedRevenue) * 100) || 0);
      detail.actual_cost_percentage = Math.round(((detail.actualCost / detail.actualRevenue) * 100) || 0);
      detail.signedByMe = detail.signedByUsers.some((s: any) => s === this.authService.userId);
      detail.lastSignedBy = detail.lastSignedBy ? detail.lastSignedBy : '--';


      detail.created_on = detail.createdOnDate ? moment.utc(detail.createdOnDate).local().format('DD MMM YYYY') : '--';
      detail.created_by = detail.createdBy ? detail.createdBy : '--';
      detail.modified_on = detail.lastModifiedDate ? moment.utc(detail.lastModifiedDate).local().format('DD MMM YYYY') : '--';
      detail.modified_by = detail.lastModifiedBy ? detail.lastModifiedBy : '--';
      detail.type_names = detail.typesAssociated ? detail.typesAssociated.map((t: any) => t.name).join(', ') : '--';

      this.detail.next(detail);
    }, error => {
      console.log(error);
      this.detail.error(error);
    });
  }
}
