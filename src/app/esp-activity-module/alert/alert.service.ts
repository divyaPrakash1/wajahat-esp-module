import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Alert, AlertType} from './alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<Alert>();
  private idx = 0;

  getObservable(): Observable<Alert> {
    return this.subject.asObservable();
  }

  success(message: string, options?: any) {
    this.subject.next(new Alert({...options, type: AlertType.Success, message, id: this.idx++}));
  }

  error(message: string, options?: any) {
    this.subject.next(new Alert({...options, type: AlertType.Error, message, id: this.idx++}));
  }

  info(message: string, options?: any) {
    this.subject.next(new Alert({...options, type: AlertType.Info, message, id: this.idx++}));
  }

  warn(message: string, options?: any) {
    this.subject.next(new Alert({...options, type: AlertType.Warning, message, id: this.idx++}));
  }
}
