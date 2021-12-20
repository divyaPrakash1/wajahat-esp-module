import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivitySharedService {

  private messageSource = new Subject();
  private subject = new Subject<any>();
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: any): void {
    this.messageSource.next(message)
  }

  

    sendMessage(message: any): void {
        this.subject.next(message);
    }

    clearMessages(): void {
        this.subject.next();
    }

    onMessage(): Observable<any> {
        return this.subject.asObservable();
    }

}