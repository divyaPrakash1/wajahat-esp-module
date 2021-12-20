import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { MatDialogConfig } from "@angular/material/dialog";
import { SocialIconPathEnum, SocialNetworkEnum, SubTypeEnum } from "../shared/enums/enums-activity";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TabKeyEnum } from "../shared/enums/tab-key-enum-activity";
import { ENV_BUILD, environment } from "src/environments/environment";
import {
  CustomTabIconDataInterface,
  TabInterface,
  TabViewOnInterface
} from "../shared/interfaces/tab-interface-activity";
import { PublicProperties } from "./models/addon.model-activity";
import { GroupVisibilityStatus } from "../groups/models/group-detail-activity.model";
// import { AuthType } from "./services/auth-activity.service";
import { ConnectAppInterface } from "./interfaces/connect-apps-activity";
import { AuthType } from "src/app/shared/services/auth.service";
// import { ExdrLanguageService } from "../languages/services/exdr-language.service";

@Injectable({ providedIn: "root" })
export class SharedService {
  private _overlayStatusSubject: Subject<any> = new Subject<any>();

  private groupIdParamSource = new ReplaySubject<string>(1);
  public groupIdParam = this.groupIdParamSource.asObservable();
  private _prevGroupId = "";
  public addonUpdate$: Subject<any> = new Subject<any>();
  public addonDelete$: Subject<string> = new Subject<string>();
  private routerData = new Subject<any>();
  public firstHeaderTabPath = "";

  // private _exdrLangService: ExdrLanguageService

  constructor(private http: HttpClient, private _snackBar: MatSnackBar, ) { }

  emitAddonUpdate() {
    this.addonUpdate$.next();
  }

  emitAddonDelete(key: string) {
    this.addonDelete$.next(key);
  }

  overlayStatus() {
    return this._overlayStatusSubject;
  }

  hideOverlay() {
    this._overlayStatusSubject.next(false);
  }

  showOverlay() {
    this._overlayStatusSubject.next(true);
  }

  changeGroupIdParam(id) {
    if (this._prevGroupId != id) {
      this._prevGroupId = id;
      this.groupIdParamSource.next(id);
    }
  }

  setFirstHeaderTab(firstTabPath: string): void {
    this.firstHeaderTabPath = firstTabPath;
  }

  getDefaultDialogConfig(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = "600px";
    dialogConfig.disableClose = true;
    dialogConfig.closeOnNavigation = true;
    return dialogConfig;
  }

  getDefaultAddonPublicProperties(): PublicProperties {
    return {
      access_token: "",
      baseURL: "",
      domain: "",
      footerDescription: "",
      footerTitle: "",
      groupIdenedi: "",
      homeTopicId: "",
      jsonData: "{\n\n}",
      language: "en",
      logoUrl: "",
      organizationName: "",
      organziationId: "",
      powerBiData: "",
      refresh_token: "",
      title: ""
    };
  }

  initEspLoginDialogConfig(): MatDialogConfig {
    const dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.disableClose = true;
    dialogConfig.data.title = "ExdrCommon.Info";
    dialogConfig.data.body = "ExdrCommon.EspNoAccess";
    dialogConfig.data.okText = "ExdrCommon.OK";
    // dialogConfig.direction = this._exdrLangService.currentLanguage.isRtl ? 'rtl' : "ltr";
    return dialogConfig;
  }

  getGroupVisibilities(): {
    key: GroupVisibilityStatus;
    name: string;
    description: string;
  }[] {
    return [
      {
        key: GroupVisibilityStatus.Public,
        name: "GroupVisibilityInfo.Public",
        description:
          "GroupVisibilityInfo.PublicDesc"
      },
      {
        key: GroupVisibilityStatus.Private,
        name: "GroupVisibilityInfo.Private",
        description:
          "GroupVisibilityInfo.PrivateDesc"
      },
      {
        key: GroupVisibilityStatus.Secret,
        name: "GroupVisibilityInfo.Invisible",
        description:
          "GroupVisibilityInfo.InvisibleDesc"
      },
      {
        key: GroupVisibilityStatus.Incognito,
        name: "GroupVisibilityInfo.Incognito",
        description:
          "GroupVisibilityInfo.IncognitoDesc"
      }
    ];
  }

  getConnectAppsItems(filter?: {
    key?: AuthType[];
    excluded?: AuthType[];
  }): ConnectAppInterface[] {
    const defaultApps = [
      {
        title: "ConnectAppsInfo.Announcement",
        subtitle: "IDenedi",
        description:
          "ConnectAppsInfo.AccouncementDesc",
        key: AuthType.Idenedi
      },
      {
        title: "ConnectAppsInfo.Chat",
        subtitle: "stemeXe",
        description:
          "ConnectAppsInfo.ChatDesc",
        key: AuthType.Stemexe
      },
      {
        title: "ConnectAppsInfo.DigitalLibrary",
        subtitle: "Technadopt",
        description:
          "ConnectAppsInfo.DigitalLibraryDesc",
        key: AuthType.Technadopt
      },
      {
        title: "ConnectAppsInfo.AutomatedProcesses",
        subtitle: "ESP",
        description:
          "ConnectAppsInfo.AutomatedProcessesDesc",
        key: AuthType.ESP
      },
      {
        title: "ConnectAppsInfo.KPIs&Activities",
        subtitle: "SimpleStrata",
        description:
          "ConnectAppsInfo.KPIs&ActivitiesDesc",
        key: AuthType.SimpleStrata
      },
      {
        title: "ConnectAppsInfo.CustomMeetingScheduler",
        subtitle: "Office 365",
        description:
          "ConnectAppsInfo.CustomMeetingSchedulerDesc",
        key: AuthType.Office365
      },
      {
        title: "ConnectAppsInfo.Analytics",
        subtitle: "Power BI",
        description:
          "ConnectAppsInfo.AnalyticsDesc",
        key: AuthType.PowerBi
      },
      {
        title: "ConnectAppsInfo.Tutorials",
        subtitle: "Intajy",
        description:
          "ConnectAppsInfo.TutorialsDesc",
        key: AuthType.Intajy
      },
      {
        title: "ConnectAppsInfo.Vacancies",
        subtitle: "Higher",
        description:
          "ConnectAppsInfo.VacanciesDesc",
        key: AuthType.Higher
      },
      {
        title: "ConnectAppsInfo.ChatBot",
        subtitle: "Microsoft",
        description:
          "ConnectAppsInfo.ChatBotDesc",
        key: AuthType.ChatBot
      }
    ];
    if (filter?.key.length) {
      return defaultApps.filter(t => filter?.key?.includes(t.key));
    }
    if (filter?.excluded?.length) {
      return defaultApps.filter(t => !filter?.excluded?.includes(t.key));
    }
    return defaultApps;
  }

  getAllowedImagesFormats() {
    return [".jpg", ".png", ".gif", ".bmp", ".jpeg"];
  }

  getAllowedDocumentsFormats() {
    return [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
  }

  getAllowedVideosFormats() {
    return [".mp4"];
  }

  areArraysDifferent(arrayA: string[], arrayB: string[]) {
    if (arrayA.length == arrayB.length) {
      for (const itemA of arrayA) {
        let found = false;
        for (const itemB of arrayB) {
          if (itemA == itemB) {
            found = true;
            break;
          }
        }
        if (!found) {
          return true;
        }
      }
    } else {
      return true;
    }

    return false;
  }

  hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  getViewOnData(): TabViewOnInterface[] {
    return [
      {
        id: 1,
        path: "../assets/images/ic-mobile.svg",
        active: false,
        name: "Mobile"
      },
      {
        id: 2,
        path: "../assets/images/ic-web.svg",
        active: false,
        name: "Web"
      }
    ];
  }

  getCustomTabIcons(id?: number): CustomTabIconDataInterface[] {
    const customTabsIconMap = [
      {
        id: 1,
        path: "../assets/images/custom-tab/1.svg"
      },
      {
        id: 2,
        path: "../assets/images/custom-tab/2.svg"
      },
      {
        id: 3,
        path: "../assets/images/custom-tab/3.svg"
      },
      {
        id: 4,
        path: "../assets/images/custom-tab/4.svg"
      },
      {
        id: 5,
        path: "../assets/images/custom-tab/5.svg"
      },
      {
        id: 6,
        path: "../assets/images/custom-tab/6.svg"
      },
      {
        id: 7,
        path: "../assets/images/custom-tab/7.svg"
      },
      {
        id: 8,
        path: "../assets/images/custom-tab/8.svg"
      },
      {
        id: 9,
        path: "../assets/images/custom-tab/9.svg"
      },
      {
        id: 10,
        path: "../assets/images/custom-tab/10.svg"
      }
    ];
    if (id) {
      return customTabsIconMap.filter(t => t.id === id);
    }

    return customTabsIconMap;
  }

  getHeaderTabs(filter?: {
    key?: string;
    excluded?: TabKeyEnum[];
  }): TabInterface[] {
    const defaultTabs = [
      {
        key: TabKeyEnum.Feed,
        iconPath: "../assets/images/icons/menu-icons/ic-news.svg",
        path: "/pages/news",
        name: environment.build === ENV_BUILD.EXCEEDERS ? "News" : "Feed",
        iseditable: 1,
        isvisible: 1,
        order: 1
      },
      {
        key: TabKeyEnum.Library,
        iconPath: "../assets/images/icons/menu-icons/ic-products.svg",
        path: "/pages/products",
        name:
          environment.build === ENV_BUILD.EXCEEDERS ? "Products" : "Library",
        iseditable: 1,
        isvisible: 1,
        order: 2
      },
      {
        key: TabKeyEnum.Requests,
        iconPath: "../assets/images/icons/menu-icons/ic-requests.svg",
        path: "/pages/applications",
        name: "Requests",
        iseditable: 1,
        isvisible: 1,
        order: 3
      },

      {
        key: TabKeyEnum.EngagementPro,
        iconPath: "../assets/images/icons/menu-icons/icon-menu-engagement.svg",
        path: "/pages/engagement/project/list",
        name: "Projects",
        iseditable: 1,
        isvisible: 1
      },
      {
        key: TabKeyEnum.Calendar,
        iconPath: "../assets/images/icons/menu-icons/ic-calendar.svg",
        path: "/pages/events",
        name: "Calendar",
        iseditable: 1,
        isvisible: 1,
        order: 4
      },
      {
        key: TabKeyEnum.Dashboards,
        iconPath: "../assets/images/custom-tab/icon-menu-dashboard.svg",
        path: "/pages/dashboards",
        name: "Dashboards",
        iseditable: 1,
        isvisible: 1,
        order: 5
      },
      {
        key: TabKeyEnum.Activities,
        iconPath: "../assets/images/icons/menu-icons/ic-activities.svg",
        path: "/pages/activities",
        name: "Activities",
        iseditable: 1,
        isvisible: 1,
        order: 6
      },
      {
        key: TabKeyEnum.ScoreCard,
        iconPath: "../assets/images/icons/menu-icons/iconMenuMeasures.svg",
        path: "/pages/scoreCard",
        name: "ScoreCard",
        iseditable: 1,
        isvisible: 1,
        order: 7
      },
      // {
      //   iconPath: "../assets/images/icons/menu-icons/ic-activities.svg",
      //   iseditable: 1,
      //   isvisible: 1,
      //   key: TabKeyEnum.MiM,
      //   name: "MiM",
      //   path: "/pages/activities/signature",
      // },
      {
        key: TabKeyEnum.Boards,
        iconPath: "../assets/images/icons/menu-icons/ic-boards.svg",
        path: "/pages/boards",
        name: "Boards",
        iseditable: 1,
        isvisible: 1,
        order: 8
      },
      {
        key: TabKeyEnum.Vacancies,
        iconPath: "../assets/images/icons/menu-icons/ic-vacancies.svg",
        path: "/pages/vacancies",
        name: "Vacancies",
        iseditable: 1,
        isvisible: 1,
        order: 9
      },
      {
        key: TabKeyEnum.Members,
        iconPath: "../assets/images/icons/menu-icons/ic-members.svg",
        path: "/pages/members",
        name: "Members",
        iseditable: 1,
        isvisible: 1,
        order: 10
      },
      {
        key: TabKeyEnum.ContactCard,
        iconPath: "../assets/images/icons/menu-icons/ic-contact-card.svg",
        path: "/pages/contact-card",
        name: "ContactCard",
        iseditable: 1,
        isvisible: 1,
        order: 11
      },
      {
        key: TabKeyEnum.Profile,
        iconPath: "../assets/images/icons/menu-icons/ic-profile.svg",
        path: "/pages/profile",
        name: "Profile",
        iseditable: 0,
        isvisible: 1,
        order: 12
      },
      {
        key: TabKeyEnum.Intajy,
        iconPath: "../assets/images/icons/menu-icons/ic-intajy.svg",
        path: "/pages/intajy",
        name: "Intajy",
        viewOn: "Web",
        iseditable: 1,
        isvisible: 1,
        order: 13
      },
      {
        key: TabKeyEnum.Blog,
        iconPath: "../assets/images/icons/menu-icons/ic-blog.svg",
        path: "/pages/blog",
        name: "Blog",
        viewOn: "Web",
        iseditable: 1,
        isvisible: 1,
        order: 14
      },
      {
        key: TabKeyEnum.Messages,
        iconPath: "/assets/images/icons/menu-icons/ic-messages.svg",
        path: "/pages/messages",
        name: "Messages",
        iseditable: 0,
        isvisible: 1,
        order: 15
      }
    ];
    if (filter?.key) {
      return defaultTabs.filter(t => t.key === filter?.key);
    }
    if (filter?.excluded?.length) {
      return defaultTabs.filter(t => !filter?.excluded?.includes(t.key));
    }
    return defaultTabs;
  }

  convertCustomsTabToTabs(customTabs: PublicProperties[]): TabInterface[] {
    return customTabs.map(tab => {
      const customTab: TabInterface = {
        data: {
          icon: tab.icon,
          name: tab.name,
          productId: tab.productId,
          productName: tab.productName,
          subtype: tab.subtype,
          viewOn: tab.viewOn?.split(",") || []
        },
        iconPath: this.getCustomTabIcons(tab.icon)[0].path,
        path: "",
        name: tab.name,
        key: `custom tab${tab?.customTabId}`,
        iseditable: 1,
        isvisible: 1,
        viewOn: tab.viewOn
      };
      switch (tab.subtype) {
        case SubTypeEnum.TOPIC:
          customTab.path = `/pages/products/details/${tab.productId}`;
          return customTab;
        case SubTypeEnum.REQUEST:
          customTab.path = `/pages/applications`;
          return customTab;
        case SubTypeEnum.DASHBOARD:
          customTab.path = `/pages/dashboards/details/${tab.productId}`;
          return customTab;
        default:
          customTab.path = `/pages/products/details/${tab?.productId}`;
          return customTab;
      }
    });
  }

  isFileImage(file: File): boolean {
    return file && file["type"].split("/")[0] === "image";
  }

  getSocialIconsMap(): Map<SocialNetworkEnum, SocialIconPathEnum> {
    const socialIconsArr = [
      { name: SocialNetworkEnum.TWITTER, path: SocialIconPathEnum.TWITTER },
      { name: SocialNetworkEnum.FACEBOOK, path: SocialIconPathEnum.FACEBOOK },
      { name: SocialNetworkEnum.LINKEDIN, path: SocialIconPathEnum.LINKEDIN },
      { name: SocialNetworkEnum.INSTAGRAM, path: SocialIconPathEnum.INSTAGRAM }
    ];
    const socialIconsMap: Map<SocialNetworkEnum, SocialIconPathEnum> = new Map<
      SocialNetworkEnum,
      SocialIconPathEnum
    >();
    socialIconsArr.forEach(icon => {
      socialIconsMap.set(icon.name, icon.path);
    });
    return socialIconsMap;
  }

  setActiveEnumData(message: string) {
    this.routerData.next(message);
  }

  getActiveEnumData(): Observable<any> {
    return this.routerData.asObservable();
  }
}
