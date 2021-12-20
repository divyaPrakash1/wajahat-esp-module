import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslationHelperService } from './translation-helper.service';
// import { ActivityAuthService, AuthType } from '../../shared/services/auth-activity.service';
import { Persona } from '../models/persona-model';
// import { AuthService, AuthType } from 'src/app/shared/services/auth.service';
import { Observable } from 'rxjs';
import { AuthService, AuthType } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  public labels: LabelModel;
  public preLoginLabels: LabelModel;
  public labelList: ListModel[] = [];
  constructor(private http: HttpClient,
    private _translationHelperService: TranslationHelperService,
    private _authService: AuthService
    // private _authService: ActivityAuthService
    ) {
    this.getLabel();
  }

  getLabel(callback?: Function): LabelModel {
    if (this.labels == null) {
      this.labels = new LabelModel();
      this.http.get('/label/getlabel', { headers: this._authService.buildAuthHeader(AuthType.ESP)}).subscribe((resp: any) => {
        this.labels = new LabelModel();
        this.labels = <LabelModel><any>resp;
        this.labels = this.translateToLocaleAll(this.labels);
        if (this.preLoginLabels == null) {
          this.preLoginLabels = JSON.parse(JSON.stringify(this.labels));
        }
        if (callback) {
          callback(this.labels);
        }
        return this.labels;
      });
    } else {
      if (callback) {
        callback(this.labels);
      }
    }
    return this.labels;
  }

  isEmpty(obj: any): boolean {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  

  updateClientLabel(callback?: Function): void {
    this.labels = new LabelModel();
    this.http.get('/label/getlabel', { headers: this._authService.buildAuthHeader(AuthType.ESP) }).subscribe((resp: any) => {
      this.labels = new LabelModel();
      this.labels = <LabelModel><any>resp;

      this.labels = this.translateToLocaleAll(this.labels);
      if (callback) {
        callback();
      }
      return this.labels;
    });
  }

  translateToLocaleAll(labels: any) {
    for (let label in labels) {
      labels[label] = this._translationHelperService.translateToLocale(labels[label]);
    }

    return labels;
  }

  getLabelList(): Observable<any> {
    return this.http.get('/webapi/label');
  }

  updateLabelList(labelList: any): Observable<any> {
    return this.http.put('/webapi/label', labelList);
  }

  get(label: string): any {
    
    if (label != undefined && label.toLowerCase() == "applications") {
      return this._translationHelperService.translateToLocale(this.getLabel().applications);
    } else if (label != undefined && label.toLowerCase() == "application") {
      return this._translationHelperService.translateToLocale(this.getLabel().application);
    } else if (label != undefined && label.toLowerCase() == "service catalog") {
      return this._translationHelperService.translateToLocale(this.getLabel().serviceCatalog);
    } else if (label != undefined && label.toLowerCase() == "submissionrequests") {
      return this._translationHelperService.translateToLocale(this.getLabel().submissionRequests);
    } else if (label != undefined && label.toLowerCase() == "submissions requests") {
      return this._translationHelperService.translateToLocale(this.getLabel().submissionRequests);
    } else if (label != undefined && label.toLowerCase() == "applicants") {
      return this._translationHelperService.translateToLocale(this.getLabel().applicants);
    } else if (label != undefined && label.toLowerCase() == "applicant") {
      return this._translationHelperService.translateToLocale(this.getLabel().applicant);
    } else if (label != undefined && label.toLowerCase() == "definitions") {
      return this._translationHelperService.translateToLocale(this.getLabel().definitions);
    } else if (label != undefined && label.toLowerCase() == "definition") {
      return this._translationHelperService.translateToLocale(this.getLabel().definition);
    } else if (label != undefined && label.toLowerCase() == "organization") {
      return this._translationHelperService.translateToLocale(this.getLabel().organization);
    } else if (label != undefined && label.toLowerCase() == "application_long_name") {
      return this._translationHelperService.translateToLocale(this.getLabel().application_long_name);
    } else if (label != undefined && label.toLowerCase() == "application_short_name") {
      return this._translationHelperService.translateToLocale(this.getLabel().application_short_name);
    } else if (label != undefined && label.toLowerCase() == "settings") {
      return this._translationHelperService.translateToLocale(this.getLabel().settings);
    } else if (label != undefined && label.toLowerCase() == "customization") {
      return "Customization";
    } else if (label != undefined && label.toLowerCase() == "login") {
      return "Login";
    } else if (label != undefined && label.toLowerCase() == "forgotpassword") {
      return "Forgot Password";
    } else if (label != undefined && label.toLowerCase() == "setpassword") {
      return "Set Password";
    } else if (label != undefined && label.toLowerCase() == "expiredlink") {
      return "Expired Link";
    } else if (label != undefined && label.toLowerCase() == "invalidlink") {
      return "Invalid Link";
    } else if (label != undefined && label.toLowerCase() == "submittedapp") {
      return "Submitted " + this._translationHelperService.translateToLocale(this.getLabel().applications);
    } else if (label != undefined && label.toLowerCase() == "applicationstatus") {
      return this._translationHelperService.translateToLocale(this.getLabel().application) + " Status";
    } else if (label != undefined && label.toLowerCase() == "organization_name") {
      return this.getOrganizationName();
    } else {
      return label;
    }

  }

  getOrganizationName(){
    var userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth'));
    var personas = userInfo.token.persoans;
    var orgPersonas = this.filterUniqueOrganizationPersonas(personas);
    var organizationId = userInfo.user.organizationId;
    var organizationName = orgPersonas.filter((x: any) => x.orgId == organizationId)[0].orgName;
    return organizationName;
  }

  filterUniqueOrganizationPersonas(personas: Persona[]): Persona[] {
    let list: Persona[] = [];
    personas.forEach((ele: any) => {
      let item: Persona = new Persona();
      item.orgImageUrl = ele.orgImageUrl;
      item.orgName = ele.orgName;
      item.orgId = ele.orgId;
      item.id = ele.id
      var obj = list.filter((item: any) => item.orgId == ele.orgId);
      if (obj && obj.length == 0) {
        list.push(item);
      }
      else if (ele.type == 'ORG') {
        obj[0].id = ele.id;
      }
    });
    return list;
  }
  
}

export class LabelModel {
  public applications: string;
  public application: string;
  public applicants: string;
  public applicant: string;
  public definitions: string;
  public definition: string;
  public organization: string;
  public settings: string;
  public application_long_name: string;
  public application_short_name: string;
  public submissionRequests: string;
  public serviceCatalog: string;
}

export class ListModel {
  public id: number;
  public labelName: string;
  public defaultValue: string;
  public userDefinedValue: string;
}
