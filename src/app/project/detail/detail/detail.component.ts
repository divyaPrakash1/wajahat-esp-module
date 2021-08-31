import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import { ProjectDetailService } from '../detail.service';
import { ProjectStatePopupComponent} from './project-state-popup/project-state-popup.component';
import { SignPopupComponent } from './sign-popup/sign-popup.component';
import { ClosePopupComponent } from './close-popup/close-popup.component';
import { ProjectDeletePopupComponent } from './project-delete-popup/project-delete-popup.component';
import { RevokePopupComponent} from './revoke-popup/revoke-popup.component';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectTagsPopupComponent } from './project-tags-popup/project-tags-popup.component';
import * as moment from 'moment';
import { ProjectSettingPopupComponent } from './project-setting-popup/project-setting-popup.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  projectDetail: any = {};
  module = 'project';
  stateList: Array<any> = [];
  showdescription = false;
  description = new FormControl('');
  showlabel = false;
  sprintLoading = true;
  sprintData: any = false;
  settingJson = [];
  setting: any = {
    labels: true,
    requirements: true,
    signatures: true,
    workspace: true,
    phases: true,
    issues: true,
    risks: true,
    sprints: true,
    attachments: true,
    comments: true
  };

  constructor(
    private detailService: ProjectDetailService,
    private router: Router,
    public dialog: MatDialog,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        console.log(d);
        this.projectDetail = d;
        this.description.setValue(d.describeValue);
        this.settingJson = d.projectSettings.projectSettingJson;
        this.setting = this.settingJsonFormatter(this.settingJson);

        this.sprintLoading = true;
        this.http.post(environment.baseURL + '/api/Sprint/GetSprintDashboard', {
          projectId: this.projectDetail.projectId,
          currentDateTime: moment().utc().format()
        }).subscribe({
          next: (result: any) => {
            this.sprintLoading = false;
            this.sprintData = result.result;
            this.sprintData.lastSignedDate = moment(this.sprintData.lastSignedDate).local().format('DD MMM YYYY');
          },
          error: (err: any) => {
            this.sprintLoading = false;
            this.sprintData = false;
          }
        });
      }
    });


    this.http.post(environment.baseURL + '/api/General/GetAllOptionSetsForAForm',
      {formTypeArray: ['ProjectOwners', 'ProjectStates', 'ProjectStatus', 'Groups', 'Labels']}
    ).subscribe((results: any) => {
      const result: any = results.result;
      const stateList = result.find((r: any) => r.formType === 'ProjectStates');
      this.stateList = stateList.result;
    });
  }
  settingJsonFormatter(json: any): any{
    const array = json ? JSON.parse(json) : [];
    for (let [key, value] of Object.entries(this.setting)) {
      const found = array.find((a:any)=> a.name === `${key}`);
      console.log(`${key}: ${value}`, this.setting[`${key}`], found);
      if(found){
        this.setting[`${key}`] = found.value;
      }
    }
    return this.setting;
  }
  updateDetail(): any{
    this.detailService.syncDetail(this.projectDetail.projectId);
  }
  onEditClick(): void{
    this.router.navigate(['project/update/' + this.projectDetail.projectId]);
  }
  onStateClick(): void{
    const stateDialog = this.dialog.open(ProjectStatePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        list: this.stateList,
        selected: this.projectDetail.projectStateId,
        projectid: this.projectDetail.projectId
      }
    });
    stateDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onSignClick(): void{
    const signDialog = this.dialog.open(SignPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        projectid: this.projectDetail.projectId
      }
    });
    signDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onRevokeClick(): void{
    const revokeDialog = this.dialog.open(RevokePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        projectid: this.projectDetail.projectId
      }
    });
    revokeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onCloseClick(): void{
    const closeDialog = this.dialog.open(ClosePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        list: this.stateList,
        selected: this.projectDetail.projectStateId,
        projectid: this.projectDetail.projectId
      }
    });
    closeDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onDeleteClick(): void{
    const dialogRef = this.dialog.open(ProjectDeletePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        projectid: this.projectDetail.projectId
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        this.router.navigate(['project/list']);
      }
    });
  }
  onProjectSetting(): void{
    const dialogRef = this.dialog.open(ProjectSettingPopupComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {
        projectid: this.projectDetail.projectId,
        setting: this.setting
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onTagClick(): void{
    const TagPopupRef = this.dialog.open(ProjectTagsPopupComponent, {
      disableClose: true,
      panelClass: 'tag-popup-dailog',
      data: {
        projectid: this.projectDetail.projectId
      }
    });
    TagPopupRef.afterClosed().subscribe(result => {
      if (result && result.reload){
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  onRequirementClick(): void{
    this.router.navigate(['project/' + this.projectDetail.projectId + '/requirements']);
  }
  onScopeClick(): void{
    this.router.navigate(['project/' + this.projectDetail.projectId + '/activities/' + this.projectDetail.projectId]);
  }
  toggleDescription(): void{
    this.showdescription = !this.showdescription;
  }
  submitDescription(): void{
    console.log(this.description.value);
    this.http.put(environment.baseURL + '/api/Project/UpdateProjectDescriptionValueFromInnerScreen', {
      projectId: this.projectDetail.projectId,
      describeValue: this.description.value
    }).subscribe((items: any) => {
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
      });
    }, error => {
      this.snackbar.open(error.error.message || 'Something went wrong', '', {
        duration: 30000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    });
  }

}
