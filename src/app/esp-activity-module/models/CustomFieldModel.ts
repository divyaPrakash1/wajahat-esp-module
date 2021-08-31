// import { FeildType } from "app/requests/esp/common/enums/field-type-enum";
// import { CurrencyModel } from "app/requests/esp/models/currency-model";
import { FeildType } from "../../esp-activity-module/enums/enums";
import { ApplicationDefinition } from "./application-definition";
import { CurrencyModel } from "./currency-model";
import { ValueDetails } from "./custom-field-value-model";
import { LookupAdonsModel } from "./lookup-ad-ons-model";

export class CustomFieldModel {
    constructor() {
        this.isVisible = true;
        this.originalAllowedValuesCriteria = "";
        this.label = "";
        this.value = "";
        this.type = 0;
        this.details = new ValueDetails();
    }

    public id!: number;
    public objectId!: number;
    public sectionTemplateFiledId!: number;
    public label: string;
    public type: number;
    public value?: string;
    public actionValue?: string;
    public isRequired!: boolean;
    public isCommon!: boolean;
    public isReadOnly!: boolean;
    public maxVal!: number;
    public minVal!: number;
    public isVisible: boolean;

    public minDate!: Date;
    public maxDate!: Date;

    public order?: number;
    public valueDate!: Date;

    public lookupValues!: CustomFieldLookupModel[];

    public sigleSelectedValue!: number;
    public singleSelections!: KeyValuePair[];

    public isSystem!: boolean;

    public isShowInList!: boolean;

    public allowedValuesCriteria!: string;
    public filterLookUp!: number;
    public originalAllowedValuesCriteria: string;
    public allowedValuesCriteriaArray!: string[];
    public selectedCurrencyId!: number;
    public selectedCurrencySymbol!: string;

    public selectedCurrenciesString!: string;
    public defaultCurrencyString!: string;

    //new implementation of lookups start
    public sectionCustomFieldId!: number;
    public isTitleField!: boolean;
    public selectedLookupText!: string;
    public details: ValueDetails;
    public fileContent: any;

    public canDisabled!: boolean;
    //new implementation of lookups end

    public lookUpId!: number;
    public lookupValue!: string; //populated in case of type 13 Lookup

    public rollup: RollUp = new RollUp();
    public calculations: Calculate[] = [];
    public reference: Reference = new Reference();
    //database mapping
    public associatedColumnName!: string;
    public associatedColumn!: string;
    public allowedCurrencies!: CurrencyModel[];
    public selectedCurrency!: CurrencyModel;
    public associatedProfileColumn!: number;
    public isSyncColumn!: boolean;
    public isSyncable!: boolean;
    public isRealTime!: boolean;
    public templateName!: string;
    public isDelete!: boolean;
    public targetFieldType!: number; //used for mapped and calculated fields
    public isTigger!: boolean;

    public isTitleFieldisPublished!: boolean;
    public canDelete!: boolean;
}


export class KeyValuePair {
    public id!: number;
    public value!: string;
}

export class CustomFieldLookupModel {
    public id!: number;
    public label!: string;
    public isSelected!: boolean;
    public order!: number;
}

export class LookUpOptions {
    public id!: number;
    public name!: string;
    public checked!: boolean;
}

export class SubApplicationOptions {
    public id!: number;
    public definitionName!: string;
    public applicantName!: string;
}

export class ImportLookupFieldModel extends CustomFieldModel {
    public nestedLookupCustomFields!: CustomFieldModel[];
}

export class RollUp {
    constructor() {
        this.conditions = [];
    }
    public aggregation!: string;
    public aggregatedFieldId!: number;
    public objectId!: number;
    public objectType!: string;
    public conditions: Condition[];
}

export class RollUpOptions {
    public lookUps: LookupAdonsModel[] = [];
    public applicationDefinitions: ApplicationDefinition[] = [];
}

export class Condition {
    constructor() {
        this.currencies = [];
    }
    public order!: number;
    public andOr!: string;
    public fieldPath!: string;
    public fieldType!: FeildType;
    public operator!: string;
    public value!: string;
    public values: number[] = [];
    public singleMultiLookupValues: CustomFieldLookupModel[] = [];
    public lookUpOptions: LookUpOptions[] = [];
    public conditions!: Condition[];
    public currencies: CurrencyModel[] = [];
    public selectedCurrency!: CurrencyModel;
    public dynamicValue!: boolean;
}

export class Reference {
    public fieldPath!: string;
    public type!: number;
}

export class Calculate extends Reference {
    public order!: number;
    public operator!: string;
    public value!: string;
}

export class LookUpsOnDefinition {
    public relatedFormType?: string;
    public lookupId?: number;
    public referenceSectionCustomFieldId?: number;
    public filterSCFIdInLookup?: number;
    public sourceValueSCFId?: number;
    public label?: string;

    constructor(lookupid?: number, refrenceSectionCustomFieldId?: number, relatedFormType?: string, filterSCFIdInLookup?: number, sourceValueSCFId?: number, label?: string) {
        this.lookupId = lookupid;
        this.referenceSectionCustomFieldId = refrenceSectionCustomFieldId;
        this.relatedFormType = relatedFormType;
        this.filterSCFIdInLookup = filterSCFIdInLookup;
        this.sourceValueSCFId = sourceValueSCFId;
        this.label = label;
    }
}

// export class LookUpFilterAllowCriteria {
//   public lookupId: number;
//   public referenceSectionCustomFieldId: number;
//   public relatedFormType: string;
//   public lookupFieldForFilterSCFId: number;
//   public label: string;
// }

export class RelatedLookupReferenceModel {
    public lookupId?: number;
    public refrenceSectionCustomFieldId?: number;
    public relatedFormType?: string;
    public lookupFieldForFilterSCFId?: number;
    public label?: string;

    constructor();
    constructor(lookupid?: number, refrenceSectionCustomFieldId?: number, relatedFormType?: string, lookupFieldForFilterSCFId?: number, label?: string) {
        this.lookupId = lookupid;
        this.refrenceSectionCustomFieldId = refrenceSectionCustomFieldId;
        this.relatedFormType = relatedFormType;
        this.lookupFieldForFilterSCFId = lookupFieldForFilterSCFId;
        this.label = label;
    }
}

export class LookupFilters {
    public usedIn!: string;
    public lookupId!: number;
    public referenceSectionCustomFieldId!: number;
    public lookupFieldForFilterSCFId!: number;
    public label!: string;
}


