import { TabKeyEnum } from "../../shared/enums/tab-key-enum-activity";
import { SubTypeEnum } from "../../shared/enums/enums-activity";

export interface TabInterface {
  data?: TabDataInterface;
  name: string;
  icon?: number;
  iconPath?: string;
  path?: string;
  key?: TabKeyEnum | string;
  productId?: string;
  productName?: string;
  iseditable?: number;
  isvisible?: number;
  viewOn?: string;
  subtype?: SubTypeEnum;
  order?: number;
}

export interface CustomTabIconDataInterface {
  id: number;
  path: string;
}

export interface TabViewOnInterface {
  id: number;
  path: string;
  active: boolean;
  name: string;
}

export interface TabOrderInterface {
  data?: TabDataInterface;
  icon?: number;
  iseditable: number;
  isvisible: number;
  key: string;
  subtype?: SubTypeEnum;
  name: string;
  order?: number;
  viewOn?: string;
}

export interface TabDataInterface {
  icon: number;
  name: string;
  productId: string;
  productName?: string;
  subtype: SubTypeEnum;
  viewOn: string[];
}

export interface TabItemConfigInterface {
  isEditable?: boolean;
  isDraggable?: boolean;
  isSelectable?: boolean;
}
