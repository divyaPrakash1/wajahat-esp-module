import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService, AuthType } from "src/app/shared/services/auth.service";
// import { ActivityAuthService, AuthType } from "../../shared/services/auth-activity.service";

@Injectable({
  providedIn: "root",
})
export class CommentsService {
  constructor(
    private _http: HttpClient, 
    // private _authService: ActivityAuthService
    private _authService: AuthService
    ) {}

  getComments(id: string, type: number): Observable<any> {
    const url = `api/Comment/GetAllByParent`;
    let data = {
      // EntityId: id,
      // EntityType: type,
      Indicator_IndicatorId: id,
    };
    return this._http.post<any>(url, data, this._authService.ssOptions);
  }
  //api/Comment/EngPro/Delete
  //api/Comment/EngPro/GetDetails

  addComment(
    text: string,
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = `api/Comment/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata),
    };
    let data ={
      Text: text,
      Indicator_IndicatorId: id,
    };
    return this._http.post<any>(url, data, options);
  }
  addCommentForMeaure(
    text: string,
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = `api/Comment/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata),
    };
    let data = {
      Text: text,
      Measure_MeasureId: id,
    };
    return this._http.post<any>(url, data, options);
  }
 

  addCommentFormScoreCard(
    text: string,
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = `api/Comment/Create`
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data =  {
      Text: text,
      KeyResult_KeyResultId	 : id,
    };
    return this._http.post<any>(url, data, options);
  }

  addCommentFormScoreCardForJob(
    text: string,
    id: string,
    engProLoggedInUserId?: string
  ): Observable<any> {
    const url = `api/Comment/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data ={
      Text: text,
      Tactic_TacticId : id,
    };
    return this._http.post<any>(url, data, options);
  }

  deleteComment(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    // const url = !isEngProActivity
    //   ? `api/Comment/Delete`
    //   : `api/Comment/EngPro/Delete`;
    const url = `api/Comment/Delete`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data = {
      CommentId: id,
    };
    return this._http.post<any>(url, data, options);
  }
}