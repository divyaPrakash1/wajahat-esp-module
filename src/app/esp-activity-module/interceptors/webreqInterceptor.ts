import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class WebReqInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let copiedReq;
    if(req.url.toString().includes("https://testing-simplestrata.azurewebsites.net/WebApi/") || req.url.toString().includes("https://esp.exceeders.com/webapi")){
    const reqCloned = this.handleBodyIn(
      req
    );
     copiedReq = reqCloned;
    }
     else copiedReq=req;
    return next.handle(copiedReq);
  }
  handleBodyIn(req: HttpRequest<any>) {


      const orgId = !!localStorage.getItem("e.user") ? JSON.parse(localStorage.getItem("e.user")!).organizationId : null;
      const idenidiUserId = localStorage.getItem("idenedi.user.id")??"";
      const entityId = localStorage.getItem("EngPro_EntityId")??"";

      let data = {
        EngPro_EntityId : entityId,
        EngPro_EntityType: 1,
        EngPro_OrganizationId: orgId,
        EngPro_OwnerIdenedi: idenidiUserId
      }


    if (req.method.toLowerCase() === 'post') {
      if (req.body instanceof FormData) {
        req.body.append("EngPro_EntityId", entityId);
        req.body.append("EngPro_OwnerIdenedi", idenidiUserId);
        req.body.append("EngPro_OrganizationId", orgId);
        req.body.append("EngPro_EntityType", "1");
        req = req.clone({
          body:req.body ,
        });
      } else {
        req = req.clone({
          body: { ...req.body, ...data },
        });
      }
    }
    if (req.method.toLowerCase() === 'get') {
      req.params.append("EngPro_EntityId", entityId);
        req.params.append("EngPro_OwnerIdenedi", idenidiUserId);
        req.params.append("EngPro_OrganizationId", orgId);
        req.params.append("EngPro_EntityType", "1");
      req = req.clone({
        params: req.params,
      });
    }
    return req;
  }
}
