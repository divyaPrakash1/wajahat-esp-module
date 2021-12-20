import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedActivityDataService {
  private subject = new Subject<any>();
  activityData:BehaviorSubject<any> = new BehaviorSubject<any>(null);  
  constructor() { } 

  

    sendMessage(message: boolean) {
        this.subject.next({ text: message });
    }

    clearMessages() {
        this.subject.next();
    }

    onMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
