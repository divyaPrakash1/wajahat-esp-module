import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject} from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LocalEnum } from  '../enums/localstorage'
import { AuthService } from './auth.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {

  private list = new BehaviorSubject<any>([]);
  private history:any = {};

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  
  get getHistoryListing(): any{
    return this.list.asObservable();
  }
  get getHistory(): any{
    return this.history;
  }

  createHistory(arg: any): any {
    this.history = {
      entityId: arg.entityId,
      entityName: arg.entityName,
      changedItems: [],
      stateChangedBy: this.authService.userId,
      stateChangedByName: this.authService.userName,
      lastUpdatedDate: moment().utc().format()
    }
  }
  addHistory(arg): any {
    this.history.changedItems.push(arg);
  }
}
