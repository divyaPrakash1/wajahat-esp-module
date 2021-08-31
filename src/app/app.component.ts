import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from './shared/services/auth.service';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  title = 'Engagement Pro - Exceeders';

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router,
    private translate: TranslateService
  ) {

    this.translate.addLangs(['en', 'ar']);
    const  browserLang  =  this.translate.getBrowserLang();
    const local = localStorage.getItem('language');
    this.translate.use(browserLang.match(/en|ar/) ? browserLang : local ? local : 'en');

    this.translate.use('en');

    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   localStorage.setItem('translation', '{}');
    // });

    if (this.location.path() === ''){
      this.checkLogin();
    }
  }
  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd && this.location.path() === ''){
        this.checkLogin();
      }
    });
  }
  checkLogin(): void {
    if (this.authService.isLoggedIn){
      this.router.navigate(['/project/list']);
    }
    else{
      this.router.navigate(['/auth/login']);
    }
  }

}
