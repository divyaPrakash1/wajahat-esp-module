import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { AdminApplicationStatusPost, ApplicationStatusPost } from '../../shared/enums/application-status-enum-activity';
import { ApplicationFeedbackModel } from '../../shared/models/ApplicationFeedbackModel-activity'
import { CustomFieldFormService } from '../../shared/services/custom-field-form-activity.service';
import { ApplicationDetail } from '../../shared/models/applicationdetailmodel-activity';
import { DefinitionStageModel } from '../../shared/models/definition-stage-activity';
import { StageCriteria } from '../../shared/models/stage-criteria-activity';
import { OrganizationUser } from '../../shared/models/organization-user-activity'
import { AssinedApplicationModel } from '../../shared/models/assinged-application-model-activity';
import { GetApplicationListType } from '../../shared/enums/get-application-list-type.enum-activity';
import { AdminApplicationViewModel } from '../../shared/models/application-view-model-activity';
import { map } from 'rxjs/operators';
import { CACHE_SKIP_HEADER } from '../../shared/inteceptors/http-cache-activity.interceptor';
import { FormArray } from '@angular/forms';
import { FolderDefinition } from '../../shared/models/folder-definition-activity.model';
import { SubmissionOption } from '../../shared/enums/submission-option.enum-activity';
import { NameId } from '../../shared/models/UserResult-activity';
import { TranslationHelperService } from '../../activity/services/translation-helper.service';
import { AuthService, AuthType } from 'src/app/shared/services/auth.service';
// import { ActivityAuthService, AuthType } from './auth-activity.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  constructor(private http: HttpClient
    , private _translationHelperService: TranslationHelperService
    // , private _authService: ActivityAuthService
    , private _authService: AuthService
  ) {

  }

  getApplicationDetails(applicationId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>('/application/detailsv3/' + applicationId, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getApplicationDetailsByKeyAnonymous(applicationKey: any): Observable<HttpResponse<any>> {
    return this.http.get<any>(`/application/bykey/${applicationKey}`, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getLinkApplicationDetails(applicationId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>('/application/linkedApplicationInfo/' + applicationId, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }
  getActionHistory(applicationId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>('/actionhistory/' + applicationId, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getApplicationsWithPaging(pageNo: number, searchText: string, applicationStatus: number, recordPerPage: number, sortBy: number, isMySpace: boolean, applicantId: string, definitionId: string, linkApplicationId: string = null): Observable<any> {
    return this.http.get<Observable<any>>('/application/list?search=' + searchText + '&filter=' + applicationStatus + '&PageNo=' + pageNo + '&RecordPerPage=' + recordPerPage + '&isMySpace=' + isMySpace + '&sortBy=' + sortBy + '&applicantId=' + applicantId + '&definationId=' + definitionId + "&linkApplicationId=" + linkApplicationId, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getDefinitionsForFilter(pageNo: number, searchText: string, applicationStatuses: number[], recordPerPage: number, sortBy: number, isMySpace: boolean, myApplications: boolean, applicantId: number, definitionId: number, parentApplicationId: number = 0, definitionIds: number[] = [], applicationListType: GetApplicationListType = GetApplicationListType.Open): Observable<any> {
    const searchObject = {
      Search: searchText,
      Statuses: applicationStatuses,
      PageNo: pageNo,
      RecordPerPage: recordPerPage,
      //IsMySpace: isMySpace,
      //myApplications: myApplications,
      type: applicationListType,
      SortBy: sortBy,
      ApplicantId: applicantId,
      DefinationId: definitionId,
      Categoreis: [],
      ParentApplicationId: parentApplicationId,
      definitionIds: definitionIds.find(x => x === -1) ? [] : definitionIds.filter(x => x !== -1),
      fieldValues: []
    }
    return this.http.post<Observable<any>>('/application/definitionForFilterv2',
      searchObject,
      this._authService.espOptions
    );
  }

  getApplicationsWithPagingV2(pageNo: number, searchText: string, applicationStatuses: number[], recordPerPage: number, sortBy: number, isMySpace: boolean, myApplications: boolean, applicantId?: number, definitionId?: number, parentApplicationId: number = 0, definitionIds: number[] = [], applicationListType: GetApplicationListType = GetApplicationListType.Open, defFieldsSearchValues: NameId[] = []): Observable<any> {
    const searchObject = {
      Search: searchText,
      Statuses: applicationStatuses,
      PageNo: pageNo,
      RecordPerPage: recordPerPage,
      //IsMySpace: isMySpace,
      //myApplications: myApplications,
      type: applicationListType,
      SortBy: sortBy,
      ApplicantId: applicantId,
      DefinationId: definitionId,
      Categoreis: [],
      ParentApplicationId: parentApplicationId,
      definitionIds: definitionIds.find(x => x === -1) ? [] : definitionIds.filter(x => x !== -1),
      searchValues: defFieldsSearchValues
    }
    return this.http.post<Observable<any>>('/application/listV4', searchObject, this._authService.espOptions);
  }

  getOpenRequestsForMim(pageNo: number, noOfRecords: number = 12): Observable<{ totalRecords: number, applications: AdminApplicationViewModel[] }> {
    return this.getApplicationsWithPagingV2(pageNo, '', [ApplicationStatusPost.Pending], noOfRecords, 1, false, false, null, null, null, [], GetApplicationListType.Open);
  }

  getOpenRequestsForMimRequest(pageNo: number, noOfRecords: number = 100): Observable<{ totalRecords: number, applications: AdminApplicationViewModel[] }> {
    return this.getApplicationsWithPagingV2(pageNo, '', [ApplicationStatusPost.Accepted, ApplicationStatusPost.Rejected, ApplicationStatusPost.Cancelled], noOfRecords, 1, false, true, null, null, null, [], GetApplicationListType.Open);
  }

  //obsolete
  getApplicationsAssinged(pageNo: number, searchText: string, applicationStatuses: number[], recordPerPage: number, sortBy: number, isMySpace: boolean, myApplications: boolean, applicantId: string, definitionId: string, parentApplicationId: number = 0, definitionIds: number[] = []): Observable<any> {
    const searchObject = {
      Search: searchText,
      Statuses: applicationStatuses,
      PageNo: pageNo,
      RecordPerPage: recordPerPage,
      IsMySpace: isMySpace,
      myApplications: myApplications,
      SortBy: sortBy,
      ApplicantId: applicantId,
      DefinationId: definitionId,
      Categoreis: [],
      ParentApplicationId: parentApplicationId,
      definitionIds: definitionIds.find(x => x === -1) ? [] : definitionIds.filter(x => x !== -1)
    }
    return this.http.post<Observable<any>>('/application/assigned', searchObject, this._authService.espOptions);
  }

  getApplicationListItem(applicationId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>('/application/' + applicationId, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }
  //http://localhost:55334/webapi/application/list?search=&filter=0&pageNo=1&recordPerPage=10&isMySpace=true&sortBy=0

  dateDifference(submitedDate): string {
    let currDate = new Date;
    let diff = Math.floor(currDate.getTime() - new Date(submitedDate).getTime());
    let day = 1000 * 60 * 60 * 24;

    let days = Math.floor(diff / day);
    let months = Math.floor(days / 31);
    let years = Math.floor(months / 12);

    let message = days.toString();
    if (days == 0) {
      return 'Today'
    }

    if (days == 1) {
      message += ' ' + this._translationHelperService.getTranslationByKey('day');
    } else {
      message += ' ' + this._translationHelperService.getTranslationByKey('days');
    }

    return message;
  }

  sendComment(model) {
    return this.http.put('/assessment/comments', model, this._authService.espOptions);
  }
  resendAction(applicationid, model) {
    return this.http.put('/actionhistory/retry/' + applicationid, model, this._authService.espOptions);
  }
  updateAllowSubmission(applicationId, isSubmissionAllowed) {
    return this.http.put('/application/allowLinkedApplicationSubmission/' + applicationId + '/' + isSubmissionAllowed, {}, this._authService.espOptions);
  }

  respondCriteria(model) {
    return this.http.post('/application/respondv2', model, this._authService.espOptions);
  }

  getApplicationFeedbackList(applicationId: number, clearCache = false): Observable<ApplicationFeedbackModel[]> {
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.ESP)
    };
    if (clearCache) {
      options.headers = options.headers.append(CACHE_SKIP_HEADER, '');
    }
    return this.http.get<any>('/application/feedback/' + applicationId, options).pipe(
      map(resp => resp)
    );
  }

  addApplicationFeedback(data: any) {
    return this.http.put<any>('/application/comments', data, this._authService.espOptions);
  }

  deleteComment(commentId: number) {
    return this.http.delete<any>('/application/comment?commentId=' + commentId, this._authService.espOptions);
  }

  deleteCommentAttachment(fileGuid: string) {
    return this.http.delete<any>(`/application/commentAttachment?fileGuid=${fileGuid}`, this._authService.espOptions);
  }

  makeApplicationFeedbackVisibleToApplicant(model: any) {
    return this.http.post('/application/feedback/visibletoapplicant/' + model.applicationId, model.feedback, this._authService.espOptions);
  }

  saveCriteriaForm(model: any, assessmentId: number) {
    return this.http.post('/application/assessment/values?assessmentId=' + assessmentId, model, this._authService.espOptions);
  }

  getApplicationSubApplications(applicationId, allowedValuesCriteria): Observable<HttpResponse<any>> {
    return this.http.get<any>('/application/subApplications/' + applicationId + '/' + allowedValuesCriteria, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  applicationAssessmentDisable(applicationId: number, assessmentId: number) {
    return this.http.put('/application/assessment/disable/' + applicationId + '/' + assessmentId, {}, this._authService.espOptions);
  }

  applicationAssessmentEnable(applicationId: number, assessmentId: number) {
    return this.http.put('/application/assessment/enable/' + applicationId + '/' + assessmentId, {}, this._authService.espOptions);
  }

  private _getCalculatedFieldsPath: string = '/application/getCalculatedValuesV2';
  getCalcuateValues(definition: any, definitionKey: string = null, onBehalfApplicantId: number = 0): Observable<any> {
    definition.sectionValues = CustomFieldFormService.mapFormFieldsPostValue(definition.form.sections);
    if (definitionKey) {
      return this.http.post<any>(`${this._getCalculatedFieldsPath}?onBehalf=${onBehalfApplicantId}&definitionKey=${definitionKey}`, definition, this._authService.espOptions);
    } else {
      return this.http.post<any>(`${this._getCalculatedFieldsPath}?onBehalf=${onBehalfApplicantId}`, definition, this._authService.espOptions);
    }
  }

  getCalcuateValuesForCriteria(definition: ApplicationDetail): Observable<any> {
    definition.stages.forEach((stage: DefinitionStageModel) => {
      stage.criteriaList.forEach((criteria: StageCriteria) => {
        if (criteria.form.sections.length > 0) {
          criteria.sectionValues = CustomFieldFormService.mapFormFieldsPostValue(criteria.form.sections);
          //criteria.formValues = CustomFieldFormService.mapFormFieldsPostValueForCriteria(criteria.form.sections[0]);
        }
      });
    });

    return this.http.post<any>(this._getCalculatedFieldsPath, definition, this._authService.espOptions);
  }

  saveReassginOwner(model: any, applicationId: number, newOwnerId: number) {
    return this.http.post('/application/reassign/assessment?applicationId=' + applicationId + '&' + 'newOwnerId=' + newOwnerId, model, this._authService.espOptions);
  }

  cancelRequest(applicationId: number, comments: string, notifiedToPersonaIds: number[], notifyApplicant: boolean) {
    let submitModel = {
      applicationid: applicationId,
      comments: comments,
      notifiedToPersonaIds: notifiedToPersonaIds,
      notifyApplicant: notifyApplicant
    }
    return this.http.put('/application/cancel', submitModel, this._authService.espOptions);
  }

  reactivateRequest(applicationId: number) {
    return this.http.put(`/application/reactivate?applicationId=${applicationId}`, {}, this._authService.espOptions);
  }

  getApplicationOwners(applicationId: number): Observable<HttpResponse<OrganizationUser[]>> {
    return this.http.get<OrganizationUser[]>(`/assessment/assessors/active?applicationId=${applicationId}`, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getFeeds(dismissed = false): Observable<HttpResponse<{ applications :AssinedApplicationModel[], totalRecords : number}>> {
    return this.http.get<{ applications :AssinedApplicationModel[], totalRecords : number}>('/SubmittalRequest/feeds?dismissed=' + dismissed, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  getApplicationFeeds(feedType: SubmissionOption, dismissed = false): Observable<{ applications :AssinedApplicationModel[], totalRecords : number}> {
    if(feedType == SubmissionOption.Assign){
      return this.http.get<{ applications :AssinedApplicationModel[], totalRecords : number}>('/submittalRequest/feeds/assigned?dismissed=' + dismissed, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) }).pipe(
        map(resp => resp.body)
      );
    }else{
      return this.getFeeds(dismissed).pipe(
        map(resp => resp.body)
      );
    }
  }

  dismiss(applicationId: number, applicationType: string): Observable<any> {
    return this.http.get<any>(`/application/dismiss/${applicationId}/${applicationType}`, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }

  postQuestion(applicationId: number, question: StageCriteria): Observable<any> {
    return this.http.post(`/application/question?applicationId=${applicationId}`, question, this._authService.espOptions);
  }

  openStage(applicationId: number, stageId: number, assessmentId: number, comments: string): Observable<any> {
    let model = {
      applicationId: applicationId,
      stageToMoveId: stageId,
      assessmentId: assessmentId,
      comments: comments
    }
    return this.http.post(`/application/openStage`, model, this._authService.espOptions);
  }

  openStageComments(applicationId: number, stageId: number): Observable<any> {
    return this.http.get(`/application/openStageComments/${applicationId}/${stageId}`, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) }).pipe(
      map(resp => resp.body)
    );
  }
  setRequestSubmitters(applicationId, childApplicantsArray: FormArray): Observable<any> {
    let endPoint = '/submittalRequest/SubmissionsSubmitters';
    let model = {
      applicationId: applicationId,
      allowedSubmitters: childApplicantsArray.value,
    }
    return this.http.put<any>(endPoint, model, { headers: this._authService.buildAuthHeader(AuthType.ESP) });
  }
  getFolderReferenceApplications(applicationId: number, definitionId: number): Observable<FolderDefinition[]> {
    return this.http.get<any>(`/application/referenceApplications?applicationId=${applicationId}&definitionId=${definitionId}`, { observe: 'response', headers: this._authService.buildAuthHeader(AuthType.ESP) }).pipe(
      map(resp => resp.body)
    );
  }


  uploadDocument(data: FormData) {
    return this.http.post('/document', data,{ headers: this._authService.buildAuthHeader(AuthType.ESP) })
  }
  updateDocument(data: FormData) {
    return this.http.put('/document', data,{ headers: this._authService.buildAuthHeader(AuthType.ESP) })
  }
  deleteDocument(docId: number) {
    return this.http.delete('/document?id=' + docId,{ headers: this._authService.buildAuthHeader(AuthType.ESP) })

  }
  getApplicationDocuments(applicationId: string, search: string = '') {
    return this.http.post('/document/get', { search: search, holderId: applicationId },{ headers: this._authService.buildAuthHeader(AuthType.ESP) })
  }
}
