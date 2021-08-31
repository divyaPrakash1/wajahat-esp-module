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
export class ProjectSprintsService {
  // Observable string sources
  private listing = new BehaviorSubject<any>([]);
  private detail = new BehaviorSubject<any>({});

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ){
    // constructor
  }

  get getlisting(): any{
    return this.listing.asObservable();
  }

  // Service message commands GetProjectById?ProjectId=3
  syncListing(args: any): void{
    this.listing.next({});
    this.http.post(environment.baseURL + '/api/Sprint/GetAllSprints', {
      projectId: args.projectId,
      search: args.searchKey,
      pageNum: args.pageNumber,
      pageSize: args.pageSize,
      filterObject: args.filter,
      currentDateTime: args.time
    }).subscribe((results: any) => {
      let result: any = results.result;
      result = result.map((r: any) => {
        r.colorCode = r.sprintStatus === 'Closed' ? '2b3443' : (r.sprintStatus === 'PastDue' ? 'e21b24' : (r.sprintStatus === 'Current' ? '8622b7' : '1da9e7'));
        r.signedByMe = r.signedByUsers ? r.signedByUsers.some((s: any) => s === this.authService.userId) : false;

        return r;
      });
      this.listing.next(result);
    }, error => {
      console.log(error);
      this.listing.next([]);
    });
  }

  get getDetail(): any{
    return this.detail.asObservable();
  }
  // Service message commands GetProjectById?ProjectId=3
  syncDetail(id: any): void{
    this.http.post(environment.baseURL + '/api/Sprint/GetSprintById', {
      sprintId: id,
      currentDateTime:  moment().utc().format()
    }).subscribe((results: any) => {
      const detail = results.result;
      detail.isDeliverableLoaded = false;
      detail.start_date = moment.utc(detail.startDate).local().format('DD MMM YYYY');
      detail.end_date = detail.dueDate ? moment.utc(detail.dueDate).local().format('DD MMM YYYY') : '--';
      detail.signedByMe = detail.signedByUsers ? detail.signedByUsers.some((s: any) => s === this.authService.userId) : false;
      detail.lastSignedBy = detail.lastSignedBy ? detail.lastSignedBy : false;
      detail.lastSignedDate = detail.lastSignedDate ? moment.utc(detail.lastSignedDate).local().format('DD MMM YYYY') : false;


      detail.created_on = detail.createdOnDate ? moment.utc(detail.createdOnDate).local().format('DD MMM YYYY') : '--';
      detail.created_by = detail.createdBy;
      detail.modified_on = detail.lastModifiedDate ? moment.utc(detail.lastModifiedDate).local().format('DD MMM YYYY') : '';
      detail.modified_by = detail.lastModifiedBy;

      this.detail.next(detail);
    }, error => {
      console.log(error);
      this.detail.error(error);
    });
  }
}
