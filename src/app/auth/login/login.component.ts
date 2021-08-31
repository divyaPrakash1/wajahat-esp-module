import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { version } from '../../../../package.json';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public version: string = version;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ){ }

  ngOnInit(): void {
    //this.authService.logout();
    console.log(this.authService.isLoggedIn);
    if(this.authService.isLoggedIn){
      const returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl;
      if (returnUrl){
        this.router.navigate([returnUrl]);
      }
      else{
        this.router.navigate(['project/list']);
      }
    }
  }

  onLoginClicked(event: any): void{
    window.location.href = 'https://authapi.idenedi.com/oauth/authorize?response_type=code&client_id='+environment.idenediClientID+'&redirect_uri='+environment.idenediRedirect+'&state=web';
  }

  onOrganizationClicked(event: any): void{
    window.location.href = 'https://authapi.idenedi.com/oauth/authorize?response_type=code&client_id='+environment.idenediClientID+'&redirect_uri='+environment.idenediRedirect+'&state=organization';
  }

}
