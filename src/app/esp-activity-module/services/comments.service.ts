import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
// import {
//   AuthType,
//   AUTH_TYPE_HEADER,
//   AuthService,
// } from "../../shared/services/auth.service";
import { Observable } from "rxjs";
import { Response } from "../models/response";
import { environment } from "../../../environments/environment";
import { AuthService, AuthType } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class CommentsService {
  constructor(private _http: HttpClient, private _authService: AuthService) {}

  getComments(id: string, type: number): Observable<any> {
    const url = `api/Comment/GetAllByParent`;
    let data = {
      // EntityId: id,
      // EntityType: type,
      Indicator_IndicatorId: id,
    };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    return this._http.post<any>(url, data, options);
  }
  //api/Comment/EngPro/Delete
  //api/Comment/EngPro/GetDetails

  addComment(
    text: string,
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Comment/Create`
      : `api/Comment/EngPro/Create`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
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
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Comment/Create`
      : `${environment.mainURL}api/Comment/EngPro/Create`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data =isEngProActivity? {
      Text: text,
      Indicator_IndicatorId: id,
    }:{
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
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Comment/Create`
      : `api/Comment/EngPro/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        !!engProLoggedInUserId ? engProLoggedInUserId?.toString() : null
      ),
    };
    let data =isEngProActivity?{
      Text: text,
      KeyPoint_KeyPointId : id,
    }: {
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
    const url = `${environment.mainURL}api/Comment/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
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
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Comment/Delete`
      : `${environment.mainURL}api/Comment/EngPro/Delete`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data = {
      CommentId: id,
    };
    return this._http.post<any>(url, data, options);
  }
}
