import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedActivityDataService {

  activityData:BehaviorSubject<any> = new BehaviorSubject<any>(null);  
  constructor() { } 
}
