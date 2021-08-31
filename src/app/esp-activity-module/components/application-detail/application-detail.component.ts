import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ApplicationDetail, RespondModel } from '../../models/applicationdetailmodel';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { SubSink } from 'subsink';
import { LabelService } from '../../services/label-service';
import { ApplicationService } from '../../services/application.service';
import { Roles } from '../../enums/roles-enum';
import { CardLoad, SlideUpDown } from '../../animations/animations';
import { ComponentName } from '../../enums/component-names-enum';
import { ManageCurrenciesService } from '../../services/manage-currencies.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
  animations: [CardLoad, SlideUpDown]
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  @Input() applicationId: number = 0;
  @Input() viewInDailog = false;
  @Input() componentName: string = '';
  @Input() callFrom: string = '';
  @Output() linkDefinitionId = new EventEmitter<number>();
  isModelChanged: boolean = false;
  @Input() applicationDetails!: ApplicationDetail;
  criteriaRespond: RespondModel = new RespondModel();
  submitButtonDisabled: boolean = false;
  ComponentName: typeof ComponentName = ComponentName;
  userRoles = Roles;

  public formHasVisibleFields: boolean = false;
  public showApplicantFeedback: boolean = true;
  public isSubmissionRequest = false;
  public submissionsPageNo = 0;
  public isCallFromMySpace = false;
  public subs = new SubSink();
  parentApplicationInfo!: ApplicationDetail;
  isMyspace:boolean=false;
  public anonymous = false;
  constructor(private route: ActivatedRoute, private applicationService: ApplicationService, public labelService: LabelService
    , private _datePipe: DatePipe, public matDialog: MatDialog,
    private _currencyService: ManageCurrenciesService
    , public translate: TranslateService,
    private _router: Router,
  ) {

    //this.applicationDetails.name = '';
    this.subs.sink = this.route.params.subscribe(params => {
      this.anonymous = this._router.url.includes('anon');
      if (params['id']) {
        this.applicationId = params['id'];
        localStorage.setItem("EngPro_EntityId",this.applicationId.toString());
      }
    });
    this.subs.sink = this.route.queryParams.subscribe(params => {
      if (params["page"]) {
        this.submissionsPageNo = +params["page"];
      }
      if (params["my"] && params["my"] == 'true') {
        this.isCallFromMySpace = true;
      }
      if (params["activeTab"] ) {
        this.showActivitiesTabs = true;
      }
    })
    if (this._router.url.indexOf('/applications/submission/') > -1) {
      this.isSubmissionRequest = true;
    } else {
      this.isSubmissionRequest = false;
    }
  }

  ngOnInit() {
    //debugger
    let applicationCalls;
    if(this.anonymous){
      applicationCalls = forkJoin(
        {
          currencies: this._currencyService.getCurrencies(),
          applicationDetails: this.applicationService.getApplicationDetailsByKeyAnonymous(this.applicationId)
        }
      );
    }else{
      applicationCalls = forkJoin(
        {
          currencies: this._currencyService.getCurrencies(),
          applicationDetails: this.applicationService.getApplicationDetails(this.applicationId)
        }
      );
    }

    // applicationCalls.pipe(
    //     catchError(error => {
    //       this._alertService.error("Something went wrong. Please try again later.");
    //       return of(error)}
    //       )
    //   )
    //   .subscribe(resp => {
    //     this.currenciesList = resp.currencies.body;
    //     this.applicationDetailSuccessHandler(resp.applicationDetails.body, 'init');
    //   }, error => {
    //     this.currenciesList = [];
    //   });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  //stageStateName(stage): string{
  //  return stage.isExpended ? 'in' : 'out';
  //}

  // public applicationDetailsLoaded = false;
  // public linkStage!: any;
  // public detailsLoading = false;
  // getApplicationDetails(callFrom: string = '') {
  //   this.detailsLoading = true;
  //   this.applicationService.getApplicationDetails(this.applicationId).subscribe(
  //     resp => {
  //       this.detailsLoading = false;
  //       this.applicationDetailSuccessHandler(resp.body, callFrom);
  //     },
  //     err => {
  //       this.detailsLoading = false;
  //     }
  //   );
  // }

  // actionHistory() {
  //   if(!this.anonymous)
  //   this.applicationService.getActionHistory(this.applicationId).subscribe(
  //     resp => {
  //       for (var i = 0; i < this.applicationDetails.stages.length; i++) {
  //         this.applicationDetails.stages[i].actionsHistory = resp.body.filter((x:any) => x.stageId == this.applicationDetails.stages[i].id);
  //       }
  //     },
  //     err => {
  //     }
  //   );
  // }

  // applicationDetailSuccessHandler(applicationDetails: ApplicationDetail, callFrom: string) {
  //   let tempModel: ApplicationDetail = new ApplicationDetail();
  //   if (callFrom == 'refreshData') {
  //     tempModel = Object.assign(this.applicationDetails, {});
  //     this._reloadList.setOption(true);
  //   }
  //   else {
  //     this._reloadList.setOption(false);
  //   }
  //   //this.applicationDetails = new ApplicationDetail();
  //   if (applicationDetails) {

  //     this.applicationDetails = applicationDetails;
  //     this.applicationDetails.stages = this.applicationDetails.stages.filter(s => s.isEnabled);
  //     this.actionHistory();
  //     this.linkStage = this.applicationDetails.stages.find(s => s.type == StageType.Link);
  //     if (this.linkStage) {
  //       this.linkDefinitionId.next(this.linkStage.linkDefinitionId);
  //     }
  //     //this.applicationDetails.form.sections.forEach(section => {
  //     //  section.fields = section.fields.filter(x => x.isVisible);
  //     //});
  //     this.applicationDetails.form.sections = this.applicationDetails.form.sections.filter(sec => sec.fields.length > 0);
  //     if (this.applicationDetails.form.sections.length > 0) {
  //       this.formHasVisibleFields = true;
  //     }
  //     this.setApplicationStatuses(this.applicationDetails);
  //     this.applicationDetails.applicationClass = this.applicationDetailsHelperService.setApplicationClass(this.applicationDetails.applicationStatusId);

  //     if (this.applicationDetails.applicationStatusId == this.applicationStatuses.Rejected || this.applicationDetails.applicationStatusId == this.applicationStatuses.Accepted) {
  //       this.applicationDetails.stages.forEach(stage => {
  //         if (stage.statusId === StageStatus.Accepted) {
  //           stage.status = "Accepted";
  //         } else if (stage.statusId === StageStatus.Rejected) {
  //           stage.status = "Rejected";
  //         } else {
  //           stage.status = "Locked";
  //         }
  //         this.applicationDetailsHelperService.checkStageIsSigned(stage);
  //         this.applicationDetailsHelperService.checkHasCriteriaToRespond(stage);
  //       });
  //     } else {
  //       var statusToSet = "Completed";
  //       const currentStage = this.applicationDetails.stages.find(s => s.id == this.applicationDetails.currentStageId);
  //       this.applicationDetails.stages.forEach(stage => {
  //         if (stage.status == "Locked" && currentStage && stage.order < currentStage.order){
  //           stage.status = "Skipped";
  //         } else if (this.applicationDetailsHelperService.checkStageLock(this.applicationDetails, stage)) {
  //           if (this.applicationDetails.applicationStatusId == this.applicationStatuses.Cancelled) {
  //             stage.status = "Locked";
  //           } else {
  //             stage.status = "Open";
  //             statusToSet = "Locked";
  //           }
  //         }
  //         else if ((this.applicationDetails.applicationStatusId == this.applicationStatuses.Invited && stage.status == "Locked") || this.applicationDetails.applicationStatusId == this.applicationStatuses.Cancelled) {
  //           stage.status = stage.status;
  //         } else {
  //           stage.status = statusToSet;
  //         }
  //         this.applicationDetailsHelperService.checkStageIsSigned(stage);
  //         this.applicationDetailsHelperService.checkHasCriteriaToRespond(stage);
  //       });
  //     }

  //     this.mapGetApplicationFormValues();

  //     if (this.applicationDetails.form.sections)
  //       this.applicationDetails.pendingFor = this.applicationService.dateDifference(this.applicationDetails.applicationSubmittedDate);

  //     if (this.componentName != ComponentName.ApplicationDetailDialogComponent)
  //       this.selectedApplication.setApplicationName = this.applicationDetails.name;
  //     this.applicationDetailsHelperService.setApplicationAssessedOnDate(this.applicationDetails);
  //     if (callFrom == 'refreshData') {
  //       tempModel.form.sections.forEach((section, sectionIndex) => {
  //         this.applicationDetails.form.sections[sectionIndex].isExpended = section.isExpended;
  //       });
  //       let activeStage = tempModel.stages.find(x => x.isExpended == true);
  //       let activeCriteriaIds:any[] = [];

  //       if (activeStage) {
  //         activeStage.criteriaList.forEach(function (criteria) {
  //           if (criteria.isExpended) {
  //             activeCriteriaIds.push(criteria.id);
  //           }
  //         })
  //         let currActiveStage = this.applicationDetails.stages.find(x => x.id == activeStage?.id);
  //         currActiveStage!.isExpended = true;  // Making current stage expended
  //         if (activeCriteriaIds.length > 0) {
  //           currActiveStage!.criteriaList.forEach(function (criteria) {
  //             for (var i = 0; i < activeCriteriaIds.length; i++) {
  //               if (criteria.id == activeCriteriaIds[i]) {
  //                 criteria.isExpended = true; // Making current criterias expended
  //               }
  //             }
  //           })
  //         }
  //       }
  //     }

  //     if (callFrom == 'init') {
  //       this.applicationDetails.form.sections.forEach(section => {
  //         section.isExpended = true;
  //       });
  //       this.applicationDetailsHelperService.showStageIfOwnerCriteriaPending(this.applicationDetails);
  //     }

  //     for (var i = 0; i < this.applicationDetails.stages.length; i++) {
  //       for (var j = 0; j < this.applicationDetails.stages[i].criteriaList.length; j++) {
  //         if (this.applicationDetails.stages[i].criteriaList[j].assessmentStatus &&
  //           this.applicationDetails.stages[i].criteriaList[j].assessmentStatus.toLocaleLowerCase() == "Reassigned".toLocaleLowerCase()) {
  //           this.applicationDetails.stages[i].criteriaList[j].isEnabled = false;
  //         }
  //       }
  //     }

  //     this.applicationDetailsHelperService.setJumpedCriterias(this.applicationDetails);
  //     //if (this.userInfoService.personas.find(x => x.id == this.applicationDetails.applicantId)) {
  //     //  this.showApplicantFeedback = true;
  //     //} else {
  //     //  this.showApplicantFeedback = false;
  //     //}
  //   } /* end resp body */
  //   if (this.selectedStageId) {
  //     this.selectedStage = this.applicationDetails.stages.find((x:any) => x.id === this.selectedStageId);
  //   }
  //   if (this.applicationDetails.type == DefinitionType.Link) {
  //     this.parentApplicationInfo = this.applicationDetailsHelperService.getParentApplicationForm(this.applicationDetails);
  //     //this.applicationDetails.form.sections = this.applicationDetails.form.sections.filter(s => s.childAccessibility == null);
  //   }
  //   this.applicationDetailsLoaded = true;
  // }
  // setApplicationStatuses(applicationDetail: ApplicationDetail) {

  //   switch (applicationDetail.applicationStatusId) {
  //     case (this.applicationStatuses.Pending):
  //       applicationDetail.applicationStatus = this.applicationStatusEnum.Pending;
  //       break;

  //     case (this.applicationStatuses.Accepted):
  //       applicationDetail.applicationStatus = this.applicationStatusEnum.Accepted;
  //       break;

  //     default:
  //       applicationDetail.applicationStatus = this.translateToLocalePipe.transform(applicationDetail.applicationStatus)
  //       break;
  //   }
  // }

  // onSubApplicationClose(event:any) {
  //   this.getApplicationDetails('refreshData');
  // }

  // toggleCriteriaMatCard(item: any, isExpended: boolean) {
  //   item.isExpended = !isExpended;
  // }

  // mapGetApplicationFormValues() {
  //   this.applicationDetails.form.sections = CustomFieldFormService.mapGenerateNestedSections(this.applicationDetails.form.sections, this.applicationDetails.sectionValues);
  //   this.applicationDetails.stages.forEach(stage => {
  //     stage.criteriaList.forEach((criteria:any) => {
  //       if (criteria.form.sections != undefined && criteria.form.sections.length > 0) {
  //         criteria.form.sections = criteria.form.sections.filter((sec:any) => sec.fields.filter((field:any) => field.isVisible).length > 0);
  //         criteria.form.sections = CustomFieldFormService.mapGenerateNestedSections(criteria.form.sections, criteria.sectionValues);

  //         // criteria.form.sections[0].fields = criteria.form.sections[0].fields.filter(fields => (fields.isVisible));
  //         // if (criteria.form.sections[0].fields && criteria.form.sections[0].fields.length > 0) {
  //         //   criteria.form.sections[0].fields = CustomFieldService.mapGetValueModel(criteria.form.sections[0].fields, criteria.formValues);
  //         // }
  //       }
  //     });
  //   });
  // }

  // onCloseApplication($event:Event) {
  //   if ($event) {
  //     this.refreshApplication();
  //   }
  // }

  // refreshApplication() {
  //   this.getApplicationDetails('refreshData');
  // }

  selectedStageId?: any = null;
  // selectedStageName:any = "";
  // selectedStageChange(stageId: number) {
  //   this.selectedStageId = stageId;
  //   this.selectedStage = this.applicationDetails.stages.find(x => x.id === stageId);
  //   this.selectedStageName = this.selectedStage?.name;
  // }

  // askQuestion = false;
  // askQuestionChange(show: boolean){
  //   this.askQuestion = show;
  // }

  // unsetSelectedStage() {
  //   this.selectedStageId = undefined;
  //   this.selectedStageName = '';
  //   this.selectedStage = undefined;
  //   this.askQuestion = false
  // }

  // gotoParentApplication() {
  //   this._router.navigate(['/pages/applications/', this.applicationDetails.parentApplicationId], { queryParams: { page: this.submissionsPageNo } })
  // }

  showActivitiesTabs = false;
  openActivitiesTabs(){
    this.showActivitiesTabs = true;
  }

  // hideActivitiesTabs(){
  //   this._router.navigate( [], { relativeTo: this.route, queryParams: { my: this.isCallFromMySpace } });
  //   this.showActivitiesTabs = false;
  // }
}
