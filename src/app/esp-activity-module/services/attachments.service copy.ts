import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
// import {
//   AuthType,
//   AUTH_TYPE_HEADER,
//   AuthService,
// } from "../../shared/services/auth.service";
import { Observable } from "rxjs";
import { Response } from "../models/response";
import { AuthService, AuthType } from "./auth.service";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AttachmentsService {
  constructor(private _http: HttpClient, private _authService: AuthService) {}

  getAttachments(id: string, type: number): Observable<any> {
    const url = `${environment.mainURL}api/Attachment/GetAllByEntity`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(AuthType.SimpleStrata),
    // };
    // options.headers.append("client-id", "web");
    // options.headers.append("locale", "en");
    let data = {
      EntityId: id,
      EntityType: type,
    };

    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    return this._http.post<any>(url, data, options);
  }

  uploadAttchament(
    data: FormData,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Attachment/Upload`
      : `${environment.mainURL}api/Attachment/Upload`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
    //   ),
    // };

    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };

    return this._http.post<any>(url, data, options);
  }
  deleteAttchament(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Attachment/Delete`
      : `${environment.mainURL}api/Attachment/EngPro/Delete`;
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
      AttachmentId: id,
    };
    return this._http.post<any>(url, data, options);
  }
}
