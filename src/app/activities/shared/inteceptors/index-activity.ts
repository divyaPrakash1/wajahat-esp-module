import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpAuthInterceptor} from './http-auth-activity.interceptor';
import {HttpCacheInterceptor} from './http-cache-activity.interceptor';

export const httpInterceptorProvidersForActivity = [
  {provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: HttpCacheInterceptor, multi: true},
];
