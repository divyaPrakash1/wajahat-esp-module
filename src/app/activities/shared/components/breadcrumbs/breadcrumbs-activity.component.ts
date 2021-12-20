// import { Component, OnInit } from '@angular/core';
// import { ExdrLanguageService } from 'src/app/languages/services/exdr-language.service';
// // import { ExdrLanguageService } from '../../../languages/services/exdr-language.service';

// @Component({
//   selector: 'xcdrs-breadcrumbs',
//   template: `
//   <div class="esp-breadcrumb" [class.breadcrumb-ltr]="!exdrLanguageService.currentLanguage.isRtl" [class.breadcrumb-rtl]="exdrLanguageService.currentLanguage.isRtl">
//   <ng-content></ng-content>
//   </div>
//   `,
//   styleUrls: ['./breadcrumbs-activity.component.scss']
// })
// export class BreadcrumbsComponent implements OnInit {

//   constructor(public exdrLanguageService: ExdrLanguageService) { }

//   ngOnInit(): void {
//   }

// }

import { Component, OnInit } from '@angular/core';
// import { ExdrLanguageService } from '../../../../languages/services/exdr-language.service';

@Component({
  selector: 'xcdrs-breadcrumbs',
  template: `
  
  <div class="esp-breadcrumb">
    <ng-content></ng-content>
  </div>
  `,
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
