import { CustomFieldValueModel } from "./custom-field-value-model-activity";

export interface CalculatedResponseModel{
  values: CustomFieldValueModel[];
  conditionalFields: InvisibleFieldInfo[];
}

export interface InvisibleFieldInfo{
  sectionIndex: number;
  sectionCustomFieldId: number;
  isVisible: boolean;
}
