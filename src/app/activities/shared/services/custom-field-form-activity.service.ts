import { Injectable } from '@angular/core';
import { FormSectionModel } from '../../shared/models/CustomizationSettingsSubmitModel-activity';
import * as _ from 'lodash';
import { CustomFieldModel } from '../../shared/models/CustomFieldModel-activity';
import { CustomFieldService } from './custom-field-activity.service';
import { CustomFieldValueModel } from '../../shared/models/custom-field-value-model-activity';
import { SectionValuesModel, SectionValueInstanceModel } from '../../shared/models/section-values-activity';
import { ApplicantSectionType } from '../enums/ApplicantSectionType-activity';
import { FeildType } from '../enums/field-type-enum-activity';
import { LookupType } from '../enums/lookup-type-enum-activity';
import { InvisibleFieldInfo } from '../../shared/models/calculated-api-response-activity.model';
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
        let sectionValue: SectionValuesModel = _.find(sectionValues, { id: section.id });
        if (sectionValue == undefined) {
          let nestedSection: FormSectionModel = _.cloneDeep(section);
          nestedSection.fields.forEach((field: CustomFieldModel) => {
            field.id = parseInt(field.id + '' + sectionIndex);
          });
          CustomFieldFormService.pushNestedSection(section, nestedSection, removeEmptyValueFields);
        } else {
          sectionValue.instances.forEach((instance: SectionValueInstanceModel, instanceIndex) => {
            let nestedSection: FormSectionModel = _.cloneDeep(section);

            nestedSection.fields = CustomFieldService.mapGetValueModel(nestedSection.fields, instance.values, 0, removeEmptyValueFields);
            nestedSection.fields = _.map(nestedSection.fields, function (field) {
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

  assignValuesForMappedAndCalcualtedTypes(fieldValues: CustomFieldValueModel[], sections: FormSectionModel[], visibilityFields: InvisibleFieldInfo[] = []) {
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
            } else if (valueObject.targetFieldType == FeildType.Money) {
              if (valueObject.value != null && valueObject.value.toString().indexOf(':') >= 0) {
                let valueArray = valueObject.value.split(':');
                sections[i].nestedSections[valueObject.sectionIndex].fields[j].value = valueArray[0];
                sections[i].nestedSections[valueObject.sectionIndex].fields[j].selectedCurrencyId = +valueArray[1];
                if (valueArray[4]) {
                  sections[i].nestedSections[valueObject.sectionIndex].fields[j].selectedCurrencySymbol = valueArray[4];
                }
              }
            }else if(valueObject.targetFieldType == FeildType.MultiSelection){
              sections[i].nestedSections[valueObject.sectionIndex].fields[j].lookupValues.forEach(lookupOption => {
                lookupOption.isSelected = false;
              });
              if(valueObject.value){
                const valuesArray = valueObject.value.split(',');
                valuesArray.forEach(selectedId => {
                  let lookupOption = sections[i].nestedSections[valueObject.sectionIndex].fields[j].lookupValues.find(lv => lv.id == +selectedId);
                  if(lookupOption){
                    lookupOption.isSelected = true;
                  }
                });
              }
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
    this.setFieldsInvisible(visibilityFields, sections);
  }

  private setFieldsInvisible(visibilityFields: InvisibleFieldInfo[], sections: FormSectionModel[]){
    visibilityFields.forEach(visibilityInfo => {
        let section = sections.find(s => s.fields.find(f => f.sectionCustomFieldId == visibilityInfo.sectionCustomFieldId));
        if(section){
          let fieldToInvisible = section.nestedSections[visibilityInfo.sectionIndex].fields.find(f => f.sectionCustomFieldId == visibilityInfo.sectionCustomFieldId);
          if(fieldToInvisible){
            fieldToInvisible.isVisible = visibilityInfo.isVisible;
          }
        }
    });
  }

  assignApplicationToDefinitionLookups(sections: FormSectionModel[], definitionId: number, applicationId: number) {
      for (var i = 0; i < sections.length; i++) {
        sections[i].nestedSections.forEach(nestedSection => {
          let defLookups = nestedSection.fields.filter(f => f.type == FeildType.LookupAddon && f.lookupType == LookupType.Definition && f.lookUpId == definitionId)
          defLookups.forEach(field => {
            field.value = applicationId.toString();
            field.isReadOnly = true;
          });
        });
      }
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
