// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export enum ENV_BUILD{
  EXCEEDERS = 0,
  STEMEXE,
  EBUILD,
  WELLNEXE
}
export const environment = {
  production: false,
  baseURL: 'https://engpro2devapi.azurewebsites.net',
  file: {
    api: 'https://exceedfileserver.azurewebsites.net',
    clientID: 'EngagementProV2',
    apiKey: '5UU9-OO9Z-FSHC-YFOY',
    clientSecret: 'LxBKgyA47DVaS1XRqfGz73Pl'
  },


  mainURL: 'https://testing-simplestrata.azurewebsites.net/WebApi/',
  espMainURL: 'https://esp.exceeders.com/webapi',
  build: ENV_BUILD.EXCEEDERS,
  isLegacyAuth: false,
  engProClientCode: 'engagementpro-ssdev',
  oppProClientCode: 'OpportunityDev',
  oppProApiHost: 'Https://oppprodevapi.azurewebsites.net',
  oppProApi: 'Https://oppprodevapi.azurewebsites.net',
  idenediProviderUrl: 'https://authapi.idenedi.com',
  idenediMlbackend: 'https://idenedimlbackend.azurewebsites.net',
  authClientId: 'idenedi_web_client',
  authClientSecret: '7x63u81880lnfyk',
  ipDataServiceUrl: 'https://api.ipdata.co',
  ipDataApiKey: '8785f9d599c704e529640ae22c70becae44748ddcdcb358725bc2391',
  apiHost: 'https://api.idenedi.com',
  idenediStaticHost: 'https://idenedistag.blob.core.windows.net',
  searchHost: 'https://searchapi.idenedi.com',
  idenediWebHost: 'https://idenedi-prod-stag.azurewebsites.net',
  webHost: 'https://stemexe.exceeders.com',
  idenediGroupId: 'GUN2002011200',
  idenediGroupIdForActivities: 'GUN2002011200',
  supportUserId: 'IPK1980101000',
  enableGroupsSelection: true,
  productContactFormWidgetUrl:
    'https://leadlineprodev.azurewebsites.net/static/component/v1.6.2.js',
  homePageTopicId: 'e485bce5-2624-40d0-b0dc-b348a8a88179',
  homePageRequestId: '827',
  singleGroupApp: false,
  enableTopicHomePage: false,
  msalAuth: {
    clientId: '3b744188-ce41-4514-9117-2e028edac581',
    authority: 'https://login.microsoftonline.com/common', // 'bef7c58b-5197-4479-903d-9fb2e68261a7',
    validateAuthority: false,
    redirectUri: 'https://stemexe-simplestrata.azurewebsites.net/',
    // redirectUri: 'http://localhost:4200/',
    clientSecret: 'QHTm4Bg42._s18G-MztElxX0d~Y~JzY-tO',
    scopes: [
      'openid',
      'User.Read',
      'Calendars.ReadWrite',
      'Calendars.Read',
      'Calendars.ReadWrite.Shared',
      'Calendars.Read.Shared'
    ],
    endPoint:'https://graph.microsoft.com/v1.0'
  },
  enableThemes: false,
  exceederClientId: 'XTD1963050800',
  SOCIAL_SHARING: {
    FB: {
      APP_ID: '345784772969902',
    },
    LINKEDIN: {
      APP_ID: '816bxkf51ta9m7',
      REDIRECT_URL:
        'https://idenedi-prod-stag.azurewebsites.net/web/socialShare/linkedin_callback.html',
      SHARE_POST_URL:
        'https://idenedi-prod-stag.azurewebsites.net/linkedin_share.php',
    },
    TWITTER: {
      APP_ID: '',
      LOADING_URL:
        'https://idenedi-prod-stag.azurewebsites.net/web/socialShare/loading.html',
      SHARE_POST_URL:
        'https://idenedi-prod-stag.azurewebsites.net/twitter_share.php',
    },
  },
  PUBLIC_USER: {
    publicUserNumber: '+375291111111',
    publicUserPassword: 'publicuserpassword!',
    countryCode: 'BY',
  },
  firebase: {
    apiKey: 'AIzaSyAmrIImSs4nEBk9Ovcj6Kj_nLY_gaYo98M',
    authDomain: 'exceeders-app-staging.firebaseapp.com',
    databaseURL: 'https://exceeders-app-staging.firebaseio.com',
    projectId: 'exceeders-app-staging',
    storageBucket: 'exceeders-app-staging.appspot.com',
    messagingSenderId: '511503782615',
    appId: '1:511503782615:web:365af90f454ee485fa5692',
    measurementId: 'G-J977B3P3SS',
    dynamicLink: {
      domainUriPrefix: 'https://exceedersstaging.page.link',
      androidPackageName: 'com.exceedgulf.exceeders.staging',
      iosBundleId: 'com.exceedgulf.Exceeders.Staging',
    },
  },
  version: '1.0.0',
  higherBaseURL: 'https://qa-higher.azurewebsites.net',



  idenediClientID: 'XEP1968041200',
  idenediClientSecret: 'rsh4jh8dacacsvz',
  idenediRedirect: 'https://engpro2dev.azurewebsites.net/auth/login/idenedi',
  idenediGroup: 'https://authapi.idenedi.com/LinkGroup.html',
  // idenediProviderUrl: '//api.idenedi.com',
  // apiHost: 'https://api.idenedi.com',
  // PUBLIC_USER: {
  //   publicUserNumber: '+375291111111',
  //   publicUserPassword: 'publicuserpassword!',
  //   countryCode: 'BY',
  // },
  // exceederClientId: 'XTD1963050800',
  // isLegacyAuth: false,
  // build: ENV_BUILD.EXCEEDERS,
  // webHost: 'https://stemexe.exceeders.com',
  // firebase: {
  //   apiKey: 'AIzaSyAmrIImSs4nEBk9Ovcj6Kj_nLY_gaYo98M',
  //   authDomain: 'exceeders-app-staging.firebaseapp.com',
  //   databaseURL: 'https://exceeders-app-staging.firebaseio.com',
  //   projectId: 'exceeders-app-staging',
  //   storageBucket: 'exceeders-app-staging.appspot.com',
  //   messagingSenderId: '511503782615',
  //   appId: '1:511503782615:web:365af90f454ee485fa5692',
  //   measurementId: 'G-J977B3P3SS',
  //   dynamicLink: {
  //     domainUriPrefix: 'https://exceedersstaging.page.link',
  //     androidPackageName: 'com.exceedgulf.exceeders.staging',
  //     iosBundleId: 'com.exceedgulf.Exceeders.Staging',
  //   },
  // },

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
