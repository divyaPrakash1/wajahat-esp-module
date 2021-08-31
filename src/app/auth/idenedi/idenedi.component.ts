import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { trim } from 'lodash';
import { version } from '../../../../package.json';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalEnum } from 'src/app/shared/enums/localstorage';

@Component({
  selector: 'app-idenedi',
  templateUrl: './idenedi.component.html',
  styleUrls: ['./idenedi.component.scss']
})
export class IdenediComponent implements OnInit {
  public version: string = version;
  queryparams: any;
  canlogin = false;

  constructor(
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.queryparams = this.activatedRoute.snapshot.queryParams;
  }

  ngOnInit(): void {
    if (this.queryparams.state === 'web'){
      const code = this.queryparams.code;
      const data = {
        code,
        redirectUri: environment.idenediRedirect,
        deviceRegisterId: '',
        deviceTypeId: ''
      };
      this.http.post(environment.baseURL + '/api/Idenedi/AuthenticateV2', data).subscribe((user: any) => {
        console.log(user.result.access_token);
        localStorage.setItem(LocalEnum.isloggedin, 'true');
        localStorage.setItem(LocalEnum.token, user.result.access_token);
        localStorage.setItem(LocalEnum.user, JSON.stringify(user.result));

        /***** For Activity Module *****/
        localStorage.setItem('idenedi.auth.token-expires-at', user.result.expires_in);
        localStorage.setItem('idenedi.auth.refresh-token', user.result.refresh_token);
        localStorage.setItem('idenedi.auth.token', user.result.idenedi_AccessToken);
        localStorage.setItem('idenedi.user.id', user.result.idenediKey);

        const returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;
        this.authService.getFileToken();
        if (returnUrl){
          this.router.navigate([returnUrl]);
        }
        else{
          this.router.navigate(['project/list']);
        }
      },
      (error: any) => {
        console.log(error);
        this.errorOnOrganization();
      });
    }
    else if (this.queryparams.state === 'organization'){
      const code = this.queryparams.code;
      localStorage.setItem('authCode', code);
      // tslint:disable-next-line: max-line-length
      // window.location.href = 'https://authapi.idenedi.com/oauth/authorize?response_type=code&client_id='+environment.idenediClientID+'&redirect_uri='+environment.idenediRedirect+'&state=organization';
      // tslint:disable-next-line: max-line-length
      window.location.href = environment.idenediGroup + '?client_id=' + environment.idenediClientID + '&redirect_uri=' + environment.idenediRedirect + '&state=link';
    }
    else if (this.queryparams.state === 'link'){
      const authCode = localStorage.getItem('authCode');
      const groupId = this.queryparams.group;

      const authToken = this.http.post(environment.baseURL + '/api/Idenedi/GetIdenediAccessToken', {
        code: authCode,
        redirectUri: environment.idenediRedirect,
        deviceRegisterId: 'string',
        deviceTypeId: 'web'
      });
      const groupDetail = this.http.get(environment.baseURL + '/api/Idenedi/GetGroupDetails?GroupId=' + groupId);
      forkJoin([authToken, groupDetail]).subscribe((results: any) => {
        const AuthResult: any = results[0];
        const Group: any = results[1].result;

        this.http.post(environment.baseURL + '/api/Idenedi/GetIdenediUserInfo', {
          code: AuthResult.result.accessToken,
          redirectUri: environment.idenediRedirect,
          deviceRegisterId: 'string',
          deviceTypeId: 'web'
        }).subscribe((user: any) => {

          const addOrg = this.http.post(environment.baseURL + '/api/Organization/AddOrganization', {
            organizationCode: groupId,
            organizationName: trim(Group.Profile.FirstName + ' ' + Group.Profile.LastName),
            address: '',
            phone: '',
            email: '',
            organizationWebsite: ''
          });
          const addGroup = this.http.post(environment.baseURL + '/api/Admin/AddIdenediGroup', {
            idenedi: groupId,
            name: trim(Group.Profile.FirstName + ' ' + Group.Profile.LastName),
            imageUrl: Group.Profile.ProfileImageUrl,
            createdOn: moment().utc().format(),
            modifiedOn: moment().utc().format()
          });
          forkJoin([addOrg, addGroup]).subscribe((added: any) => {
            const orgID = added[0].result;
            const idenediGroupID = added[1].result;

            const linkgroup = this.http.post(environment.baseURL + '/api/Admin/LinkIdenediGroupsUnAuth', [
              {
                organizationId: orgID,
                idenediGroupID,
                idenedi: groupId,
                name: trim(Group.Profile.FirstName + ' ' + Group.Profile.LastName),
                imageUrl: Group.Profile.ProfileImageUrl,
                createdOn: moment().utc().format(),
                modifiedOn: moment().utc().format()
              }
            ]);
            const addUser = this.http.post(environment.baseURL + '/api/User/AddUserWhileCreatingOrg', {
              organizationId: orgID,
              idenediGroupID,
              idenedi: AuthResult.result.idenedi,
              firstName: user.result.firstName,
              lastName: user.result.lastName,
              profileImageUrl: user.result.profileImageUrl,
              countryISOCode: user.result.countryISOCode,
              instanceId: user.result.instanceId,
              entityType: user.result.entityType,
              email: user.result.ConfirmedAuthorizationEmail
            });
            forkJoin([linkgroup, addUser]).subscribe((last: any) => {
              const userAdded = last[1].result;

              this.http.post(environment.baseURL + '/api/Organization/AddAdminToOrganization?OrganizationId=' + orgID + '&UserId=' + userAdded, {}).subscribe((laster: any) => {
                // asdf
                this.canlogin = true;
                this.syncMember(groupId, orgID, idenediGroupID);
              },
              (error: any) => {
                console.log(error);
                this.errorOnOrganization();
              });
            },
            (error: any) => {
              console.log(error);
              this.errorOnOrganization();
            });
          },
          (error: any) => {
            console.log(error);
            this.errorOnOrganization();
          });
        },
        (error: any) => {
          console.log(error);
          this.errorOnOrganization();
        });
      },
      (error: any) => {
        console.log(error);
        this.errorOnOrganization();
      });
    }
    else if (this.queryparams.state === 'admin'){
      const groupId = this.queryparams.group;
      // const protocol = window.location.protocol;
      this.http.get('//api.idenedi.com/api/user/' + groupId).subscribe((org: any) => {
        console.log(org);
        const data = {
          idenedi: groupId,
          name: trim(org.Profile.FirstName + ' ' + org.Profile.LastName),
          imageUrl: org.Profile.ProfileImageUrl,
          createdOn: moment().utc().format(),
          modifiedOn: moment().utc().format()
        };
        this.http.post(environment.baseURL + '/api/Admin/AddIdenediGroup', data).subscribe((result: any) => {
          console.log(result);
          const request = [{
            idenediGroupID: result.result,
            idenedi: groupId,
            name: trim(org.Profile.FirstName + ' ' + org.Profile.FirstName),
            imageUrl: org.Profile.ProfileImageUrl,
            createdOn: moment().utc().format(),
            modifiedOn: moment().utc().format()
          }];
          this.http.post(environment.baseURL + '/api/Admin/LinkIdenediGroups', request).subscribe((success: any) => {
            this.router.navigate(['/settings']);
          },
          (error: any) => {
            console.log(error);
            this.errorOnOrganization();
          });
        },
        (error: any) => {
          console.log(error);
          this.errorOnOrganization();
        });
      },
      (error: any) => {
        console.log(error);
        this.errorOnOrganization();
      });
    }
    else if (this.queryparams.error === 'access_denied'){
      this.router.navigate(['auth/login']);
    }
  }

  errorOnOrganization(): void{
    this.snackbar.open('Something went wrong. Please try again', '', {
      duration: 3000,
      horizontalPosition: 'start',
    });
    this.router.navigate(['auth/login']);
  }

  onLoginClicked(event: any): void{
    window.location.href = 'https://authapi.idenedi.com/oauth/authorize?response_type=code&client_id=' + environment.idenediClientID + '&redirect_uri=' + environment.idenediRedirect + '&state=web';
  }
  syncMember(groupId: any, orgID: any, idenediId: any): void{
    this.http.get(environment.baseURL + '/api/Idenedi/GetGroupAccessToken?GroupId=' + groupId).subscribe((token: any) => {
      this.http.post(environment.baseURL + '/api/Idenedi/GetMembersByGroup', {
        groupId: groupId,
        accessToken: token.result.accessToken
      }).subscribe((users: any) => {
        if (users.result){
          const data = users.result.map((u: any) => {
            return {
              organizationid: orgID,
              idenediGroupId: idenediId,
              idenedi: u.Idenedi,
              firstName: u.Profile.FirstName,
              lastName: u.Profile.LastName,
              profileImageUrl: u.Profile.ProfileImageUrl,
              countryISOCode: u.Profile.CountryISOCode,
              instanceId: '',
              entityType: u.Profile.EntityType,
              email: '',
            };
          });
          this.http.post(environment.baseURL + '/api/User/AddUserAfterCreatingOrgMultiple', data).subscribe((req: any) => {
            console.log(req);
          });
        }
      });
    });
  }
}
