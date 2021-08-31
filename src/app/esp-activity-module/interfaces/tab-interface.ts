import { SubTypeEnum, TabKeyEnum } from "../enums/enums";

export interface TabInterface {
  name: string,
  iconPath: string
  path: string
  key: TabKeyEnum | string
  isvisible?: boolean
  viewOn?: string
  subtype?: SubTypeEnum
}

export interface TabOrderInterface {
  icon: number
  iseditable: number
  isvisible: number
  key: string
  name: string
  order: number
  viewOn: string
}
