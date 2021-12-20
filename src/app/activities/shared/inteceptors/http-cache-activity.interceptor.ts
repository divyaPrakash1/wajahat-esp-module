import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {share, tap} from 'rxjs/operators';

export const CACHE_RESET_HEADER = 'x-reset-cache';
export const CACHE_SKIP_HEADER = 'x-skip-cache';

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  private cachedData = new Map<string, any>();

  constructor() {
  }

  public intercept(httpRequest: HttpRequest<any>, handler: HttpHandler) {

    if (httpRequest.headers.has(CACHE_RESET_HEADER) || ['POST', 'PUT', 'DELETE'].includes(httpRequest.method)) {
      this.cachedData.clear();
    }

    if (httpRequest.method !== 'GET' || httpRequest.headers.has(CACHE_SKIP_HEADER)) {
      return handler.handle(httpRequest);
    }

    const lastResponse = this.cachedData.get(httpRequest.urlWithParams);
    if (lastResponse) {
      return (lastResponse instanceof Observable)
        ? lastResponse : of(lastResponse.clone());
    }

    const requestHandle = handler.handle(httpRequest).pipe(
      tap((stateEvent) => {
        if (stateEvent instanceof HttpResponse) {
          this.cachedData.set(
            httpRequest.urlWithParams,
            stateEvent.clone()
          );
        }
      }),
      share()
    );

    this.cachedData.set(httpRequest.urlWithParams, requestHandle);

    return requestHandle;
  }
}
