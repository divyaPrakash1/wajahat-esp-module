import { FormModel } from "./application-definition";
import { CustomFieldValueModel } from "./custom-field-value-model";

export class LookupAdonsModel {
  constructor() {
    this.isChanged = false;
  }
  public id!: number;
  public lookupItemId!: number;
  public lookupId!: number;
  public name!: string;
  public type!: string;
  public isVisible!: boolean;
  public isMain!: boolean;
  public isShowToApplicant!: boolean;
  public isVariable!: boolean;
  public form!: FormModel;
  public fieldsCount!: number;
  public titleCustomFieldId!: number;
  public isChanged: boolean;
  public title!: string;
  public applicant!: string;
  public formSectionValues!: labels[];
  public isRealTime!: boolean;
  public isPublished: boolean = true;
  public profileTemplateIds: number[] = [];
  public profileTemplates!: string;
}

export class LookupAddonsItemModel {
  constructor() {
    this.id = 0;
    this.lookup = new LookupAdonsModel();
    this.values = [];
  }
  public id: number;
  public lookup: LookupAdonsModel;
  public values: CustomFieldValueModel[];
  public isVisible!: boolean;
  public isRealTime!: boolean;
  public importKey!: string;
  public formSectionValues!: labels[];
}

export class LookupAddonsItemPaginationModel {

  public lookupId!: number;
  public applicantId!: number;
  public page!: number;
  public recordPerPage!: number;
  public search!: string;

}

export class labels {
  label!: string;
  value!: string;
}
