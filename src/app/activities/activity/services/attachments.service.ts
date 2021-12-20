import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService, AuthType } from "src/app/shared/services/auth.service";
// import { ActivityAuthService, AuthType } from "../../shared/services/auth-activity.service";

@Injectable({
  providedIn: "root",
})
export class AttachmentsService {
  constructor(
    private _http: HttpClient,
    private _authService: AuthService
    // private _authService: ActivityAuthService
    ) {}

  getAttachments(id: string, type: number): Observable<any> {
    const url = `api/Attachment/GetAllByEntity`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(AuthType.SimpleStrata),
    // };
    // options.headers.append("client-id", "web");
    // options.headers.append("locale", "en");
    let data = {
      EntityId: id,
      EntityType: type,
    };
    return this._http.post<any>(url, data, this._authService.ssOptions);
  }

  uploadAttchament(
    data: FormData,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = `api/Attachment/Upload`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    return this._http.post<any>(url, data, options);
  }
  deleteAttchament(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = `api/Attachment/Delete`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data = {
      AttachmentId: id,
    };
    return this._http.post<any>(url, data, options);
  }
}
