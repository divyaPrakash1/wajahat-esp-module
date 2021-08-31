import { Injectable } from '@angular/core';
import { Roles } from '../enums/roles-enum';
//import { LabelService } from './label-service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Persona } from '../models/persona-model';

@Injectable({
providedIn: 'root'
})
export class UserInfoService {
  private userInfo: any = null;
  fullName!: string;
  email!: string;
  role: string = Roles.Applicant;
  imageUrl!: string;
  personas: Persona[] = [];
  orgPersonas!: Persona[];
  organizationId!: number;
  organizationName!: string;
  organizationImageUrl!: string;
  profileTemplateIds: number[] = [];
  applicantPersonaId!: number;
  isApplicant!: boolean;
  public static readonly applicantDefaultPage = '/myspace';
  public static readonly applicantStemexDefaultPage = '/request/my';
  public static readonly adminDefualtPage = '/applications'
  constructor(
    //private labelService?: LabelService,
    private translate?: TranslateService,
    private router?: Router,
  ) {
    
  }

  update() {
    
  }

  mergePersona() {
    let uniqueOrgIds: number[] = [];
    this.personas.forEach(persona => {
      if (uniqueOrgIds.indexOf(persona.orgId) < 0) {
        uniqueOrgIds.push(persona.orgId);
      }
    });
    uniqueOrgIds.forEach(orgId => {
      let orgPersonas: Persona[] = [];
      orgPersonas = this.personas.filter(p => p.orgId == orgId);
      if (orgPersonas.length > 0) {
        if (orgPersonas.filter(p => p.type == 'ORG' || p.type == 'APP').length >= 2) {
          _.remove(this.personas, function (persona) {
            return persona.orgId == orgId && persona.type == 'APP';
          });
        }
      }
    });
    console.log(this.personas);
  }

  updateSessionStorage(imageUrl: string) {
    this.imageUrl = imageUrl;
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.user.imageUrl = imageUrl
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
  }

  updateNameInSessionStorage(name: string) {
    this.fullName = name;
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.user.name = name;
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
  }

  updateNameImageInSessionStorage(name: string, imageUrl: string) {
    this.fullName = name;
    this.imageUrl = imageUrl;
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.user.name = name;
    this.userInfo.user.imageUrl = imageUrl
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
  }

  updateProfileTemplateIdsInSessionStorage(ids: number[]) {
    this.profileTemplateIds = ids;
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.user.profileTemplateIds = ids;
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
  }

  removePersonaFromSessionStorage(personaType: string) {
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    for (var i = 0; i < this.userInfo.token.persoans.length; i++) {
      if (this.userInfo.token.persoans[i].type == personaType) {
        this.userInfo.token.persoans.splice(i, 1);
      }
    }
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
    return this.userInfo.token.persoans;
  }

  addPersonaSessionStorage(personaType: string, personaId: number) {
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.token.persoans.push({ id: personaId, type: personaType });
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
    return this.userInfo.token.persoans;
  }

  updatePersonaImageUrl(organizationId: number, imageUrl: string) {
    this.userInfo = JSON.parse(sessionStorage.getItem('ngStorage-auth')!);
    this.userInfo.token.persoans.filter((x:any) => x.orgId == organizationId)[0].orgImageUrl = imageUrl;
    sessionStorage.setItem('ngStorage-auth', JSON.stringify(this.userInfo));
    this.update();
  }

  setAuthorizationData(data:any, redirectUrl: string = UserInfoService.applicantDefaultPage) {

    var persoans = JSON.parse(data.personas);

    var result = {
      token: {
        accessToken: data.access_token,
        expiry: new Date(data['.expires']),
        refreshToken: data.refresh_token,
        persoans: persoans
      },
      user: {
        name: data.name,
        email: data.email,
        role: data.role,
        imageUrl: data.imageUrl,
        organizationId: data.organizationId,
        profileTemplateIds: data.profileTemplateIds ? data.profileTemplateIds.split(',').map(Number) : [],
        applicantPersonaId: data.applicantPersonaId ? +data.applicantPersonaId : 0
      }
    };

    sessionStorage.setItem('ngStorage-auth', JSON.stringify(result));
    //this.labelService.updateClientLabel();
    this.update();

    if (result.user.role != Roles.Applicant) {
      this.translate?.use('en');
    }

    let rdUrl = UserInfoService.adminDefualtPage;
    if (redirectUrl != UserInfoService.applicantDefaultPage) {
      rdUrl = redirectUrl;
    }

    //if (result.user.role == Roles.Admin) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  this.router.navigateByUrl(rdUrl);
    //  if (rdUrl == this.router.url) {
    //    this._dataSharingService.accountSwitched.next(true);
    //  }
    //} else if (result.user.role == Roles.User) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  this.router.navigateByUrl(rdUrl);
    //  if (rdUrl == this.router.url) {
    //    this._dataSharingService.accountSwitched.next(true);
    //  }
    //} else if (result.user.role == Roles.Applicant) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  if (!this._dataSharingService.isStemexUser) {
    //    if (redirectUrl != UserInfoService.applicantDefaultPage) {
    //      this.router.navigateByUrl(redirectUrl);
    //    } else {
    //      this.notificationService.getNotification().subscribe((resp: NotificationModel) => {
    //        if (resp.actionCenterCount > 0) {
    //          this.router.navigateByUrl(UserInfoService.applicantDefaultPage)
    //        } else {
    //          this.router.navigateByUrl(UserInfoService.adminDefualtPage);
    //        }
    //      }, err => {
    //        this.router.navigateByUrl(UserInfoService.adminDefualtPage);
    //      });
    //    }
    //  }
    //  else
    //    this.router.navigateByUrl((redirectUrl != UserInfoService.applicantDefaultPage) ? redirectUrl : UserInfoService.applicantStemexDefaultPage);

    //  if (redirectUrl == this.router.url) {
    //    this._dataSharingService.accountSwitched.next(true);
    //  }
    //}
  }

  setWindowsAuthorizationDataInStorage(data:any) {
    var personas = data.token.personas;
    let expirayDate: Date = new Date();
    expirayDate.setDate(expirayDate.getDate() + 365);
    var result = {
      token: {
        accessToken: data.token.accessToken,
        expiry: expirayDate,
        refreshToken: "",
        persoans: data.token.personas
      },
      user: {
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        imageUrl: data.user.imageUrl,
        organizationId: data.user.organizationId,
        profileTemplateIds: data.user.profileTemplateIds ? data.user.profileTemplateIds.split(',').map(Number) : []
      }
    };

    sessionStorage.setItem('ngStorage-auth', JSON.stringify(result));
    this.setWindowsAuthorizationData();
  }
  setWindowsAuthorizationData() {
    //this.labelService.updateClientLabel();
    this.update();

    if (this.role != Roles.Applicant) {
      this.translate?.use('en');
    }
    //if (this.role == Roles.Admin) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  this.router.navigateByUrl(UserInfoService.adminDefualtPage);
    //} else if (this.role == Roles.User) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  this.router.navigateByUrl(UserInfoService.adminDefualtPage);
    //} else if (this.role == Roles.Applicant) {
    //  this._dataSharingService.lookupAdons.next(null);
    //  if (!this._dataSharingService.isStemex)
    //    this.router.navigateByUrl(UserInfoService.applicantDefaultPage);
    //  else
    //    this.router.navigateByUrl(UserInfoService.applicantStemexDefaultPage);
    //}
  }

  filterUniqueOrganizationPersonas(personas: Persona[]): Persona[] {
    let list: Persona[] = [];
    personas.forEach(ele => {
      let item: Persona = new Persona();
      item.orgImageUrl = ele.orgImageUrl;
      item.orgName = ele.orgName;
      item.orgId = ele.orgId;
      item.id = ele.id
      var obj = list.filter(item => item.orgId == ele.orgId);
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


