import { ApplicantSectionType } from "../../shared/enums/ApplicantSectionType-activity";
import { CustomFieldModel } from "../../shared/models/CustomFieldModel-activity";
import { ApplicantDTO } from './ApplicantDTO-activity';

export class CustomizationSettingsSubmitModel {
  constructor(

  ) { }

  public id: number;
  public name: string;
  public emailAddress: string;
  public profilePicUrl: string;
  public profileTemplates: number[];
  public profileTemplateString: string;
  public sections: CustomizationSettingsSectionModel[];

}

export class FormSectionModel {
  constructor() {
    this.fields = [];
  }

  public id: number;
  public defaultName: string;
  public isMultipule: boolean = false;
  public isTitleHidden?: boolean = false;
  public childAccessibility: boolean = false;
  public order?: number;
  public index: number;
  public fields: CustomFieldModel[] = [];
  public nestedSections: FormSectionModel[];
  public isExpended: boolean = false;
  public isRequiredMissing: boolean = true;
  public isActive: boolean;
  public lastUpdatedOn: Date;
  public type: ApplicantSectionType;
  public isDefault: boolean;
  public isDelete: boolean;
  public isBaseSection: boolean;
  public isValid?: boolean;
  public isFocused?: boolean;
}

export class CustomizationSettingsSectionModel {
  constructor(

  ) {

  }

  public id: number;
  public defaultName: string;
  public isMultipule: boolean;
  public order?: number;
  public index: number;
  public fields: CustomizationSettingsField[];
  public nestedSections: CustomizationSettingsSectionModel[];
  public isExpended: boolean = false;
  public isRequiredMissing: boolean = true;
  public isActive: boolean;
  public lastUpdatedOn: Date;
  public type: ApplicantSectionType;
  public isDefault: boolean;
}

export class CustomizationSettingsField {
  constructor(

  ) {
    this.details = {};

  }

  public id: number;
  public objectId: number;
  public label: string;
  public type: number;
  public value: string;
  public isRequired: boolean;
  public isReadOnly: boolean;
  public isVisible: boolean;
  public maxVal: number;
  public minVal: number;

  public minDate: Date;
  public maxDate: Date;

  public order?: number;
  public valueDate: Date;

  public fileContent: any;

  public sectionTemplateFiledId: number;

  public lookupValues: CustomizationSettingsLookupModel[];

  public details?: any;

  public lookUpId: number;
  public lookupValue: string;
  public selectedCurrencySymbol: number;
  public allowedValuesCriteria: string;
  public isTigger: boolean;
  public sectionCustomFieldId: number;
  public targetFieldType?: number; //used for mapped and calculated fields
  public selectedCurrencyId?: number;

  //public sigleSelectedValue: number;
  //public singleSelections: CustomFieldSingleSelection[];


}


//export class CustomFieldSingleSelection {
//  public id: number;
//  public value: string;
//  public isSelected: boolean;
//}

export class CustomizationSettingsLookupModel {
  public id: string;
  public label: string;
  public isSelected: boolean;
  public order: number;
}

export class ApplicantModelWithTemplate {
  public applicant: ApplicantDTO;
  public sections: CustomizationSettingsSectionModel[];
}
