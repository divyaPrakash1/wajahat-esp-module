import {TabInterface} from "../../shared/interfaces/tab-interface-activity";
import {SubTypeEnum} from "../../shared/enums/enums-activity";

export class Addon {
  public Type: string;
  public BaseUrl: string;
  public OrganziationId?: any;
  public Domain?: string;
  public HomeTopicId?: string;
  public AccessToken?: string;
  public Id?: string
  public technadoptAuthData?: TechnadoptAuthData;
  public customTabData?: CustomTabData
  public espClaimOwnershipData?: EspClaimOwnership
  public PublicProperties?: PublicProperties
  public Configuration?: Configuration
  public InstanceId?: string
  public EntityType?: string
  public TeamIds?: Array<any>
}

export class TechnadoptAuthData {
  accessToken: string
  expiresIn: number
  roles: string[]
}

export interface EspClaimOwnership {
  url: string;
  name: string;
  id: number;
  filedId: string;
}

export class CustomTabData {
  name?: string
  productId?: string
  icon?: number
  viewOn?: string
  subtype?: SubTypeEnum
  customTabId?: string
}

export interface PublicProperties {
  access_token?: string
  baseURL?: string
  domain?: string
  groupIdenedi: string
  homeTopicId?: string
  icon?: number
  jsonData?: any
  name?: string
  organizationName?: string
  organziationId?: string
  powerBiData?: any
  productId?: string
  productName?: string
  refresh_token?: string
  subtype?: number
  title?: string
  viewOn?: string,
  sortedTabs?: TabInterface[]
  tabOrder?: any[]
  customTabId?: string
  language?:string
  logoUrl?:string
  footerDescription?: string,
  footerTitle?: string,
}

export interface Configuration {
  domain?: string,
  userId?: string,
  organziationId?: string,
  espTokenId?: number,
  baseURL?: string,
  access_token?: string,
  refresh_token?: string
}

export class PowerBiData {
  displayName: string
  webUrl: string
  id: string
  isReadOnly: boolean
  groupId: string
  embedUrl: string
}


export class JsonData {
  constructor(public data: {
    iseditable: number
    isvisible: number
    key: string
    name: string
    order: number
  }[]) {
  }
}
