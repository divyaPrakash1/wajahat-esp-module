import { Injectable } from '@angular/core';
// import { FormSectionModel } from '../../models/CustomizationSettingsSubmitModel';
import * as _ from 'lodash';
import { ApplicantSectionType, FeildType } from '../enums/enums';
import { CustomFieldValueModel } from '../models/custom-field-value-model';
import { CustomFieldModel } from '../models/CustomFieldModel';
import { FormSectionModel } from '../models/CustomizationSettingsSubmitModel';
import { SectionValueInstanceModel, SectionValuesModel } from '../models/section-values';
import { CustomFieldService } from './custom-field.service';
// import { CustomFieldModel, Calculate, Reference, Condition } from '../../profile-customization/Model/CustomFieldModel';
// import { CustomFieldService } from './custom-field.service';
// import { CustomFieldValueModel } from '../../models/custom-field-value-model';
// import { SectionValuesModel, SectionValueInstanceModel } from '../../models/section-values';
// import { ApplicantSectionType } from '../enums/ApplicantSectionType';
// import { FeildType } from '../enums/field-type-enum';
@Injectable()
export class CustomFieldFormService {

  constructor(private _customFieldService: CustomFieldService) {
  }

  static initNestedSections(sections: FormSectionModel[]) {
    sections.forEach((section: FormSectionModel, sectionIndex) => {
      let nestedSection: FormSectionModel = _.cloneDeep(section);
      nestedSection.fields.forEach((field: CustomFieldModel) => {
        field.id = parseInt(field.id + '' + sectionIndex);
      });
      section.nestedSections.push(nestedSection);
    });
    return sections;
  }

  static mapGenerateNestedSections(sections: FormSectionModel[], sectionValues: SectionValuesModel[], removeEmptyValueFields = false) {
    sections.forEach((section: FormSectionModel, sectionIndex) => {
      section.nestedSections = [];
      if (sectionValues && sectionValues.length > 0) {
        let sectionValue: any = _.find(sectionValues, { id: section.id });
        if (sectionValue == undefined) {
          let nestedSection: FormSectionModel = _.cloneDeep(section);
          nestedSection.fields.forEach((field: CustomFieldModel) => {
            field.id = parseInt(field.id + '' + sectionIndex);
          });
          CustomFieldFormService.pushNestedSection(section, nestedSection, removeEmptyValueFields);
        } else {
          sectionValue.instances.forEach((instance: SectionValueInstanceModel, instanceIndex:any) => {
            let nestedSection: FormSectionModel = _.cloneDeep(section);

            nestedSection.fields = CustomFieldService.mapGetValueModel(nestedSection.fields, instance.values, 0, removeEmptyValueFields);
            nestedSection.fields = _.map(nestedSection.fields, function (field:any) {
              return _.assign(field, {
                id: parseInt(field.id + '' + instanceIndex)
              });
            });
            CustomFieldFormService.pushNestedSection(section, nestedSection, removeEmptyValueFields);
          });
        }
      } else {
        let nestedSection: FormSectionModel = _.cloneDeep(section);
        nestedSection.fields.forEach((field: CustomFieldModel) => {
          field.id = parseInt(field.id + '' + sectionIndex);
        });
        CustomFieldFormService.pushNestedSection(section, nestedSection, removeEmptyValueFields);
      }

    }); 
    if (removeEmptyValueFields) {
      sections = sections.filter(sec => sec.nestedSections.length > 0);
    }
    return sections;
  }

  private static pushNestedSection(section: FormSectionModel, nestedSection: FormSectionModel, avoidEmptySection = false) {
    if (avoidEmptySection) {
      if (nestedSection.fields.filter(x => x.isVisible).length > 0) {
        section.nestedSections.push(nestedSection);
      }
    } else {
      section.nestedSections.push(nestedSection);
    }
  }
  static mapFormFieldsPostValue(sections: FormSectionModel[]): SectionValuesModel[] {
    let sectionValues: SectionValuesModel[] = [];
    sections.forEach((section: FormSectionModel, sectionIndex) => {
      if (section.type != ApplicantSectionType.ViewOnly) {
        let sectionValue: SectionValuesModel = new SectionValuesModel;
        sectionValue.id = section.id;
        sectionValue.instances = [];
        section.nestedSections.forEach((nestedSection: FormSectionModel, nestedSectionIndex) => {
          let sectionValueInstance: SectionValueInstanceModel = new SectionValueInstanceModel;
          sectionValueInstance.values = CustomFieldService.mapPostValueModel(nestedSection.fields, nestedSection.id);
          sectionValue.instances.push(sectionValueInstance);
        });
        sectionValues.push(sectionValue);
      }
    });
    return sectionValues;
  }

  static mapFormFieldsPostValueForCriteria(section: FormSectionModel): CustomFieldValueModel[] {
    let values: CustomFieldValueModel[] = [];
    values = CustomFieldService.mapPostValueModel(section.fields, section.id);
    return values;
  }

  assignValuesForMappedAndCalcualtedTypes(fieldValues: CustomFieldValueModel[], sections: FormSectionModel[]) {
    fieldValues.forEach(valueObject => {
      for (var i = 0; i < sections.length; i++) {
        var allowBreak: boolean = false;
        for (var j = 0; j < sections[i].fields.length; j++) {
          if (sections[i].nestedSections[valueObject.sectionIndex] && sections[i].nestedSections[valueObject.sectionIndex].fields[j].sectionCustomFieldId == valueObject.sectionCustomFieldId) {
            if (sections[i].nestedSections[valueObject.sectionIndex].fields[j].type != FeildType.LookupAddon) {
              sections[i].nestedSections[valueObject.sectionIndex].fields[j].value = valueObject.value;
            }
            sections[i].nestedSections[valueObject.sectionIndex].fields[j].targetFieldType = valueObject.targetFieldType;
            if (valueObject.targetFieldType == FeildType.Attachment) {
              sections[i].nestedSections[valueObject.sectionIndex].fields[j].details = valueObject.details;
            } else if (valueObject.targetFieldType == FeildType.DateTime) {
              const customField: CustomFieldModel = new CustomFieldModel();
              customField.type = FeildType.DateTime;
              customField.value = valueObject.value;
              sections[i].nestedSections[valueObject.sectionIndex].fields[j].value = this._customFieldService.getFeildValue(customField);
            } else if (valueObject.targetFieldType == FeildType.Money) {
              const customField: CustomFieldModel = new CustomFieldModel();
              customField.type = FeildType.Money;
              customField.value = valueObject.value;
              sections[i].nestedSections[valueObject.sectionIndex].fields[j].value = this._customFieldService.getFeildValue(customField);
            }
            allowBreak = true;
            break;
          }
        }
        if (allowBreak) {
          break;
        }
      }
    });
  }

  assignValuesForMappedAndCalcualtedTypesSection(fieldValues: CustomFieldValueModel[], section: FormSectionModel) {
    fieldValues.forEach(valueObject => {
      for (var j = 0; j < section.fields.length; j++) {
        if (section.fields[j].sectionCustomFieldId == valueObject.sectionCustomFieldId) {
          if (section.fields[j].type != FeildType.LookupAddon) {
            section.fields[j].value = valueObject.value;
          }
          section.fields[j].targetFieldType = valueObject.targetFieldType;
          if (valueObject.targetFieldType == FeildType.Attachment) {
            section.fields[j].details = valueObject.details;
          } else if (valueObject.targetFieldType == FeildType.DateTime) {
            const customField: CustomFieldModel = new CustomFieldModel();
            customField.type = FeildType.DateTime;
            customField.value = valueObject.value;
            section.fields[j].value = this._customFieldService.getFeildValue(customField);
          } else if (valueObject.targetFieldType == FeildType.Money) {
            const customField: CustomFieldModel = new CustomFieldModel();
            customField.type = FeildType.Money;
            customField.value = valueObject.value;
            section.fields[j].value = this._customFieldService.getFeildValue(customField);
          }
          break;
        }
      }
    });
  }

  addSection(sectionsList: FormSectionModel[], section: FormSectionModel) {
    let newSection = _.cloneDeep(section);//Object.assign({}, section);

    newSection.fields.forEach((field: CustomFieldModel) => {
      field.id = parseInt(field.id + '' + _.random(1, 255));
    });
    sectionsList.push(newSection);
  }

  removeSection(sectionsList: FormSectionModel[], section: FormSectionModel) {
    _.pullAt(sectionsList, _.findIndex(sectionsList, section));
  }

  removeSectionByIndex(sectionsList: FormSectionModel[], index: number) {
    _.pullAt(sectionsList, index);
  }
}
