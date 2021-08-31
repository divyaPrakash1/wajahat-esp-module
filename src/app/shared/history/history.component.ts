import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ProfilePicture } from '../users/user-image';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  @Input() entityid: any;
  @Input() entity: any = 'project';

  loading = true;
  historyList: Array<any> = [];
  totalrecord: 0;

  constructor(
    private http: HttpClient,
    private profilePicture: ProfilePicture,
  ) { }

  ngOnInit(): void {
    this.getHistory();
  }
  getHistory(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/History/GetChangeHistory?EntityName='+this.entity+'&EntityId='+this.entityid, {}).subscribe((results: any) => {
      this.totalrecord = results.recordCount;
      this.historyList = results.result.map((h: any)=>{
        if(h.columnName === 'duedate'){
          h.currentValueName = h.currentValueName ? moment.utc(h.currentValueName).local().format('DD MMM YYYY') : '';
          h.previousValueName = h.previousValueName ? moment.utc(h.previousValueName).local().format('DD MMM YYYY') : '';
        }
        h.datetime = moment.utc(h.changedDate).local().format('DD MMM YYYY [at] h:mm a');
        const firstName = h.changedByName.split(' ').slice(0, -1).join(' ');
        const lastName = h.changedByName.split(' ').slice(-1).join(' ');
        h.userProfilePicture = this.profilePicture.generate(firstName, lastName);
        return h;
      })
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

}
