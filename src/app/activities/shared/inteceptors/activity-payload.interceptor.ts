import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class ActivityPayloadInterceptor implements HttpInterceptor {
  SourceSystemId: any = null;
  SourceTenantId:any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params["SourceSystemId"]) {
        this.SourceSystemId = +params["SourceSystemId"];
      } else {
        this.SourceSystemId = null;
      }
      if (params["SourceTenantId"]) {
        this.SourceTenantId = +params["SourceTenantId"];
      } else {
        this.SourceTenantId = null;
      }
      if (params["SourceObjectTypeId"]) {
        this.SourceObjectTypeId = +params["SourceObjectTypeId"];
      } else {
        this.SourceObjectTypeId = null;
      }
      if (params["SourceObjectId"]) {
        this.SourceObjectId = +params["SourceObjectId"];
      } else {
        this.SourceObjectId = null;
      }
    })
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let copiedReq; 
    if(this.checkApi(req)) {
    const reqCloned = this.handleBodyIn(
      req
    );
     copiedReq = reqCloned;
    }
     else copiedReq=req;
    return next.handle(copiedReq);
  }
  handleBodyIn(req: HttpRequest<any>) {
      let data = {
        SourceSystemId : this.SourceSystemId,
        SourceTenantId: this.SourceTenantId,
        SourceObjectTypeId: this.SourceObjectTypeId,
        SourceObjectId: this.SourceObjectId
      }

    if (req.method.toLowerCase() === 'post') {
      if (req.body instanceof FormData) {
        req.body.append("SourceSystemId", this.SourceSystemId ? this.SourceSystemId + '' : null);
        req.body.append("SourceTenantId", this.SourceTenantId ? this.SourceTenantId + '' : null);
        req.body.append("SourceObjectTypeId", this.SourceObjectTypeId ? this.SourceObjectTypeId + '' : null);
        req.body.append("SourceObjectId", this.SourceObjectId ? this.SourceObjectId + '' : null);
        req = req.clone({
          body:req.body ,
        });
      } else {
        req = req.clone({
          body: { ...req.body, ...data },
        });
      }
    }
    // if (req.method.toLowerCase() === 'get') {
    //   console.log("req.url", req.url);
    //   req.params.append("SourceSystemId", sourceSystemId);
    //   req.params.append("SourceTenantId", sourceTenantId);
    //   req.params.append("SourceObjectTypeId", sourceObjectTypeId);
    //   req.params.append("SourceObjectId", sourceObjectId);
    //   req = req.clone({
    //     params: req.params,
    //   });
    // }
    return req;
  }

  checkApi(req) {
    // if(
    //   // req.url.toString().includes("api/IndicatorStemeXe/Create") || 
    //   req.url.toString().includes("api/IndicatorStemeXe/Update")
    //   // req.url.toString().includes("api/IndicatorStemeXe/CreateRecurring")
    //   ) {
    //   return true;
    // } else {
      return false;
    // }

  }
}
