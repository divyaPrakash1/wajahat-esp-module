import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  list: Array<any> = [];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get(environment.baseURL + '/api/Admin/GetLinkedGroups').subscribe((org: any) => {
      console.log(org);
      this.list = org.result;
    });
  }

  onLinkGroup(): void{
    //https://authapi.idenedi.com/LinkGroup.html?client_id=<client_id>&redirect_uri=<redict_uri>&state=<state>
    window.location.href = environment.idenediGroup+'?client_id='+environment.idenediClientID+'&redirect_uri='+environment.idenediRedirect+'&state=admin';

  }

}
