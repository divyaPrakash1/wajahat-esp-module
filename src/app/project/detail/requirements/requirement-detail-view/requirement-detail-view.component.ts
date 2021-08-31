import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import { ProjectRequirementsService } from '../requirements.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { RequirementTagsPopupComponent } from '../requirement-tags-popup/requirement-tags-popup.component';
import { of } from 'rxjs';
import { RequirementCategoryPopupComponent } from '../requirement-category-popup/requirement-category-popup.component';

@Component({
  selector: 'app-requirement-detail-view',
  templateUrl: './requirement-detail-view.component.html',
  styleUrls: ['./requirement-detail-view.component.scss']
})
export class RequirementDetailViewComponent implements OnInit, OnDestroy {
  @Input() id: string;
  tabs: Array<any> = [
    {
      name: 'Details',
      link: 'detail'
    },
    {
      name: 'Deliverables',
      link: 'deliverable'
    },
    {
      name: 'Additional',
      link: 'additional'
    },
    {
      name: 'Activities',
      link: 'activities'
    }
  ];
  module = 'requirement';
  activeLink = 'detail';
  showdescription = false;
  description = new FormControl('');
  loading = true;
  detail: any = {};
  subscription: any = of('');

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private router: Router,
    private requirementService: ProjectRequirementsService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getDetail();
    this.subscription = this.requirementService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.loading = false;
        this.detail = d;
        this.description.setValue(d.describeValue);
        this.http.post(environment.baseURL + '/api/Project/GetAllSignatures', {
          module: 'requirement',
          entityId: this.id
        }).subscribe((results: any) => {
          this.detail.signatureList = results.result.map((sign: any) => {
            return sign;
          });
        });
      }
    });
  }
  ngOnDestroy(): void{
    console.log('ngOnDestroy');
    this.detail = {};
    this.loading = true;
    this.subscription.unsubscribe();
  }
  getDetail(): void{
    this.requirementService.syncDetail(this.id);
  }
  updateDetail(): any{
    this.requirementService.syncDetail(this.id);
  }
  toggleDescription(): void{
    this.showdescription = !this.showdescription;
  }
  submitDescription(): void{
    console.log(this.description.value);
    this.http.post(environment.baseURL + '/api/Requirements/EditRequirementDescription', {
      requirementId: this.id,
      description: this.description.value,
      lastModifiedOn:  moment().utc().format(),
      modifiedBy: this.authService.userId
    }).subscribe((items: any) => {
      this.loading = true;
      this.showdescription = false;
      this.requirementService.syncDetail(this.id);
    }, error => {
      this.snackbar.open(error.error.message || 'Something went wrong', '', {
        duration: 30000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    });
  }
  onCategoryClick(): void{
    const TagPopupRef = this.dialog.open(RequirementCategoryPopupComponent, {
      disableClose: true,
      panelClass: 'tag-popup-dailog',
      data: {
        id: this.id
      }
    });
    TagPopupRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        console.log(result);
        this.loading = true;
        this.requirementService.syncDetail(this.id);
      }
    });
  }
  onTagClick(): void{
    const TagPopupRef = this.dialog.open(RequirementTagsPopupComponent, {
      disableClose: true,
      panelClass: 'tag-popup-dailog',
      data: {
        id: this.id,
        project: this.detail.projectId
      }
    });
    TagPopupRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        console.log(result);
        this.loading = true;
        this.requirementService.syncDetail(this.id);
      }
    });
  }
}
