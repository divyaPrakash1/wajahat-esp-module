import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import { AuthService, AuthType } from './auth.service';
import { environment } from '../../../environments/environment';

export interface AppAppearanceData {
  theme: ColorTheme
}

export const enum ColorTheme {
  DefaultGreen = 1,
  PersianGreen,
  YellowishOrange,
  PinkishOrange,
  Lipstick,
  Azure,
  LightishBlue,
  DodgerBlue,
  BlueBayoux,
  Black
}

const THEMES_COLORS_MAP = {
  [ColorTheme.DefaultGreen]: ['#6cb33f', '#a0da6c'],
  [ColorTheme.PersianGreen]: ['#01a888', '#01a888'],
  [ColorTheme.YellowishOrange]: ['#f8971d', '#f8971d'],
  [ColorTheme.PinkishOrange]: ['#f26648', '#f26648'],
  [ColorTheme.Lipstick]: ['#e21b24', '#e21b24'],
  [ColorTheme.Azure]: ['#00aeef', '#00aeef'],
  [ColorTheme.LightishBlue]: ['#367dff', '#367dff'],
  [ColorTheme.DodgerBlue]: ['#564cfe', '#564cfe'],
  [ColorTheme.BlueBayoux]: ['#525f81', '#525f81'],
  [ColorTheme.Black]: ['#303030', '#303030'],
}

const APP_APPEARANCE_ADDON_NAME = 'App Appearance';

@Injectable({
  providedIn: 'root'
})
export class AppAppearanceService {

  private cachedAppAppearance: { [groupId: string]: AppAppearanceData } = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  getAppAppearanceData(groupId: string): Observable<any> {
    if (this.cachedAppAppearance[groupId]) {
      return of(this.cachedAppAppearance[groupId]);
    }
    const url = `${environment.apiHost}/api/group/${groupId}/addon`;
    const options = {headers: this.authService.buildAuthHeader(AuthType.Idenedi)};
    return this.http.get<any>(url, options).pipe(
      map((addons = []) => {
        const appearanceAddon = addons.find(
          (a:any) => a.Type === APP_APPEARANCE_ADDON_NAME
        );
        if (!appearanceAddon) {
          return null;
        }
        return {
          theme: appearanceAddon.PublicProperties?.organziationId || ColorTheme.DefaultGreen
        };
      })
    );
  }

  setColorTheme(theme: ColorTheme): void {
    const themeColors = THEMES_COLORS_MAP[theme];
    document.documentElement.style.setProperty('--primary-color', themeColors[0]);
    document.documentElement.style.setProperty('--primary-color-lighter', themeColors[1]);
  }

}
