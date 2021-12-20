import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
// import { ActivityAuthService, AuthType } from "./auth-activity.service";
import { environment } from "../../../../environments/environment";
import { map } from "rxjs/operators";
import { AuthService, AuthType } from "src/app/shared/services/auth.service";

export interface AppAppearanceData {
  theme: ColorTheme;
}

export const enum ColorTheme {
  DefaultGreen = 1,
  PersianGreen,
  PinkishOrange,
  Lipstick,
  YellowishOrange,
  Azure,
  LightishBlue,
  DodgerBlue,
  BlueBayoux,
  Black,
  Golden
}

export const THEMES_COLORS_MAP = {
  [ColorTheme.DefaultGreen]: ["#6cb33f", "#a0da6c"],
  [ColorTheme.PersianGreen]: ["#01a888", "#01a888"],
  [ColorTheme.PinkishOrange]: ["#f26648", "#f26648"],
  [ColorTheme.Lipstick]: ["#e21b24", "#e21b24"],
  [ColorTheme.YellowishOrange]: ["#f8971d", "#f8971d"],
  [ColorTheme.Azure]: ["#00aeef", "#00aeef"],
  [ColorTheme.LightishBlue]: ["#367dff", "#367dff"],
  [ColorTheme.DodgerBlue]: ["#6666cc", "#6666cc"],
  [ColorTheme.BlueBayoux]: ["#525f81", "#525f81"],
  [ColorTheme.Black]: ["#303030", "#303030"],
  [ColorTheme.Golden]: ["#b68a35", "rgba(182, 138, 53, 0.6)"]
};

export const APP_APPEARANCE_ADDON_NAME = "App Appearance";

@Injectable({
  providedIn: "root"
})
export class AppAppearanceService {
  private cachedAppAppearance: { [groupId: string]: AppAppearanceData } = {};

  constructor(
    private http: HttpClient, 
    // private authService: ActivityAuthService
    private authService: AuthService
    ) {}

  getAppAppearanceData(groupId: string): Observable<AppAppearanceData> {
    if (this.cachedAppAppearance[groupId]) {
      return of(this.cachedAppAppearance[groupId]);
    }
    // const url = `assets/mock/addon.json`;
    // TODO uncomment before commit
    const url = `${environment.apiHost}/api/group/${groupId}/addon`;
    //
    const options = {
      headers: this.authService.buildAuthHeader(AuthType.Idenedi)
    };
    return this.http.get<any>(url, options).pipe(
      map((addons = []) => {
        const appearanceAddon = addons.find(
          a => a.Type === APP_APPEARANCE_ADDON_NAME
        );
        if (!appearanceAddon) {
          return null;
        }
        if (
          appearanceAddon.PublicProperties?.organziationId >
          Object.keys(THEMES_COLORS_MAP).length
        ) {
          return {
            theme: ColorTheme.DefaultGreen
          };
        }
        return {
          theme:
            appearanceAddon.PublicProperties?.organziationId ||
            ColorTheme.DefaultGreen
        };
      })
    );
  }

  setColorTheme(theme: ColorTheme): void {
    const themeColors = THEMES_COLORS_MAP[theme];
    document.documentElement.style.setProperty(
      "--primary-color",
      themeColors[0]
    );
    document.documentElement.style.setProperty(
      "--primary-color-lighter",
      themeColors[1]
    );
  }
}
