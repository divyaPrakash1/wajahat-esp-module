import { LookUpOptions } from "./CustomFieldModel";

export class CustomFieldValueModel {
  constructor() {
    this.details = new ValueDetails();
    this.sectionIndex = 0;
  }
  public id!: number;
  public sectionCustomFieldId!: number;
  public value!: string;
  public sectionId!: number;
  public sectionIndex: number;
  public selectedLookupText!: string;
  public isSync!: boolean;
  public details: ValueDetails;
  public type!: number;  
  public isRealTime!: boolean;
  public targetFieldType!: number; //used for mapped and calculated fields
  public lookupItems: LookUpOptions[] = [];
}

export class ValueDetails {
  public createdOn: Date = new Date();
  public downloadUrl: string = "";
  public mimeType: string = "";
  public name: string = "";

  //for upload
  public type!: string;
  public size!: string;
}

export interface FormSectionValue {
  label: string;
  value: string;
}
