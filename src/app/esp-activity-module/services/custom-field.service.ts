import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { CustomFieldLookupModel, CustomFieldModel } from '../models/CustomFieldModel';
import { FeildType } from '../enums/enums';
import { CustomFieldValueModel } from '../models/custom-field-value-model';
import { ActionValue } from '../models/action-model';
import { CurrencyModel } from '../models/currency-model';
import { TranslateToLocalePipe } from '../pipes/translate-to-locale.pipe';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldService {

  constructor(private _datePipe: DatePipe, private translateToLocalePipe: TranslateToLocalePipe) { }

  isFormValid(customFieldValidParam: boolean[]) {
    let formIsValid = false;
    for (let _i = 0; _i < customFieldValidParam.length; _i++) {
      if (_i == 0) {
        formIsValid = true;
      }
      if (!!customFieldValidParam[_i] == false) {
        formIsValid = false;
      }
    }
    return formIsValid;
  }

  getFeildValue(feild: CustomFieldModel) {
    switch (feild.type) {
      case FeildType.MultiSelection: {
        let values = '';
        for (let i = 0; i < feild.lookupValues.length; i++) {
          if (feild.lookupValues[i].isSelected) {
            values += this.translateToLocalePipe.transform(feild.lookupValues[i].label) + ', ';
          }

          if (feild.lookupValues.length - 1 == i && values != '') {
            values = this.translateToLocalePipe.transform(values.substring(0, values.length - 2));
          }
        }

        return values;
      }
      case FeildType.SingleSelection: {
        let values = '';
        for (let i = 0; i < feild.lookupValues.length; i++) {
          if (<string><any>feild.lookupValues[i].id == feild.value) {
            values = feild.lookupValues[i].label;
          }
        }

        return values;
      }

      case FeildType.DateTime: case FeildType.Date: {
        if (feild.value) {
          //const momentFormated = moment.utc(feild.value).format('DD MMM, yyyy');
          return moment.parseZone(feild.value).format('DD MMM, YYYY');
          //const angularFormated = this._datePipe.transform(feild.value, 'dd MMM, yyyy');
          //return angularFormated;
        } else {
          return '';
        }
      }

      case FeildType.Attachment: {
        return feild.details && feild.details.name ? feild.details.name : '';
      }

      case FeildType.Money: {
        if (feild.value && feild.selectedCurrencySymbol) {
          return feild.selectedCurrencySymbol + ' ' + feild.value;
        }
        else if (feild.value && feild.value.indexOf(':') > 0) {
          var values: string[] = feild.value.split(':');
          if (values[4]) {
            return values[4] + ' ' + values[0]
          }
        }
        return "";
      }
      case FeildType.LookupAddon: {
        return feild.selectedLookupText ? feild.selectedLookupText : feild.lookupValue;
      }
      case FeildType.MultiLine: {
        return feild?.value?.replace(/\n/g, "<br />");
      }
      default:
        return feild.value;
    }
  }

  getIconFileExtention(fileName: string) {
    if (fileName) {
      const folder = 'file-extensions/';
      let extension = fileName.split('.').pop();
      extension = extension?.toLocaleLowerCase();
      if (extension == "csv" || extension?.startsWith("xl")) {
        return folder + "iconsDocumentsXlsGreen.svg"
      } else if (extension == "gif" || extension == "jpeg" || extension == "png" || extension == "jpg" || extension == "bmp") {
        return folder + "iconsDocumentsImgGreen.svg";
      } else if (extension?.startsWith("pdf")) {
        return folder + "iconsDocumentsPdfGreen.svg";
      } else if (extension == "pptx" || extension == "ppt" || extension == "potx" || extension == "pot" || extension == "odp" || extension == "ppsx" || extension == "pps" || extension == "pptm" || extension == "potm" || extension == "ppsm") {
        return folder + "iconsDocumentsPptxGreen.svg";
      } else if (extension == "txt" || extension == "doc" || extension == "docx" || extension == "rtx" || extension == "rft" || extension == "text") {
        return folder + "iconsDocumentsDocxGreen.svg";
      }
      else {
        return folder + "iconsDocumentsUnknownGreen.svg";
      }
    }
    return '';
  }

  getFileExtention(fileName: string) {
    let extension: any = "";
    if (fileName) {
      extension = fileName.split('.').pop();
      extension = extension.toUpperCase();
    }
    return extension;
  }

  getFileNameWithoutExtension(fileName: string) {
    if (fileName) {
      let lastIndex = fileName.lastIndexOf('.');
      if (lastIndex > -1) {
        return fileName.substring(0, lastIndex)
      } else {
        return fileName;
      }
    }
    return '';
  }

  bytesToSize(bytes:any) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 KB';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }

  public static mapPostValueModel(customFields: CustomFieldModel[], sectionId: number, fieldValues: any[] = []): CustomFieldValueModel[] {
    let fieldValueAlreadySaved = false;
    let sectionIndex: number = 0;
    customFields.forEach(field => {
      let value: string = "";
      value = this.formatValue(field);
      fieldValueAlreadySaved = false;
      if (field) {
        fieldValues.forEach((fieldValue:any) => {
          if (fieldValue.sectionCustomFieldId == field.sectionCustomFieldId) {
            fieldValueAlreadySaved = true;

            fieldValue.sectionId = sectionId;
            fieldValue.value = value;
            fieldValue.selectedLookupText = field.selectedLookupText;
            fieldValue.details = null;
          }
        });
      }
      if (!fieldValueAlreadySaved) {
        if (field != null) {
          fieldValues.push(
            {
              id: 0,
              sectionCustomFieldId: field.sectionCustomFieldId,
              sectionId: sectionId,
              sectionIndex: sectionIndex,
              value: value,
              selectedLookupText: field.selectedLookupText,
              details: null,
              isSync: field.isSyncColumn,
              type: field.type,
              isRealTime: field.isRealTime,
              targetFieldType: field.targetFieldType,
              lookupItems: []
            });
        }
      }

    });
    return fieldValues;
  }

  public static formatValue(field: any): string {
    let value: any;
    switch (field.type) {
      case FeildType.MultiSelection: {
        value = field.lookupValues.filter((x:any) => x.isSelected).map(function (item:any) { return item.id }).join(",");
        break;
      }
      case FeildType.Money: {
        if (field.value && field.selectedCurrencyId && field.selectedCurrencySymbol) {
          value = field.value + ':' + field.selectedCurrencyId + ':' + field.selectedCurrencySymbol;
        } else {
          value = "";
        }
        break;
      }
      case FeildType.Attachment: {
        value = field.value;
        if (field.value == '') {
          field = null;
        }
        break;
      }
      case FeildType.DateTime: {
        if (field.value) {
          const date = moment(field.value);
          if (date.isValid()) {
            value = moment(field.value).format('YYYY-MM-DDT00:00:00Z');//'YYYY-MM-DDT00:00:00Z'
          } else {
            value = field.value;
          }
        }
        break
      }
      default: {
        value = field.value;
        break;
      }
    }
    return value;
  }

  static mapGetValueModel(customFields: CustomFieldModel[], customFieldsValues: CustomFieldValueModel[], titleFieldId: number = 0, removeEmptyValueField = false): CustomFieldModel[] {
    let removeIndexes: number[] = [];
    if (customFieldsValues != null && customFieldsValues.length > 0)
      customFieldsValues.forEach(function (valueObject) {
        customFields.forEach(function (field, index) {
          if (valueObject.sectionCustomFieldId == field.sectionCustomFieldId) {
            field.isRealTime = valueObject.isRealTime
            if (field.id == titleFieldId) {
              field.isTitleField = true;
            }
            switch (field.type) {
              case FeildType.MultiSelection: {
                field.lookupValues.map(x => x.isSelected = false);
                if (valueObject.value) {
                  valueObject.value.split(',').forEach(val => {
                    field.lookupValues.forEach(lookupVal => {
                      if (lookupVal.id == parseInt(val)) {
                        lookupVal.isSelected = true;
                      }
                    });
                  });
                } else {
                  removeIndexes.push(index)
                }
                break;
              }
              case FeildType.Money: {
                if (valueObject.value.indexOf(':') > -1) {
                  let moneyValues = valueObject.value.split(':');
                  field.value = moneyValues[0];
                  field.selectedCurrencyId = parseInt(moneyValues[1]);
                  field.selectedCurrencySymbol = moneyValues[4];

                } else {
                  removeIndexes.push(index);
                }
                break;
              }
              case FeildType.LookupAddon: {
                field.selectedLookupText = valueObject.selectedLookupText;
                field.value = valueObject.value;
                if (!field.value) {
                  removeIndexes.push(index);
                }
                break;
              }
              case FeildType.Attachment: {
                field.details = valueObject.details;
                field.value = valueObject.value;
                if (!field.details) {
                  removeIndexes.push(index);
                }
                break;
              }
              //case FeildType.Mapped:
              case FeildType?.Calculated: {
                field.targetFieldType = valueObject.type;
                if (valueObject.type == FeildType.Attachment) {
                  field.details = valueObject.details;
                  if (!field.details) {
                    removeIndexes.push(index);
                  }
                } else if (field.targetFieldType == FeildType.MultiSelection) {
                  if (valueObject.value) {
                    const values = valueObject.value.split(',');
                    values.forEach(value => {
                      let lookup: CustomFieldLookupModel = new CustomFieldLookupModel();
                      lookup.isSelected = true;
                      lookup.label = value;
                      field.lookupValues.push(lookup);
                    })
                  } else {
                    removeIndexes.push(index);
                  }
                }
                break;
              }
              default: {
                field.value = valueObject.value;
                if (!field.value) {
                  removeIndexes.push(index);
                }
                break;
              }
            }
          }
        });
      });
    if (removeEmptyValueField) {
      this.removeByIndex(removeIndexes, customFields);
      customFields = customFields.filter(f => customFieldsValues.map(v => v.sectionCustomFieldId).includes(f.sectionCustomFieldId));
    }
    return customFields;
  }

  static removeByIndex(indexes: number[], customFields: CustomFieldModel[]) {
    for (var i = indexes.length - 1; i >= 0; i--)
      customFields.splice(indexes[i], 1);
  }

  static mapGetActionValueModel(customFields: CustomFieldModel[], values: ActionValue[]): CustomFieldModel[] {
    if (values != null && values.length > 0)
      values.forEach(function (valueObject) {
        customFields.forEach(function (field) {
          if (+valueObject.actionKey == field.sectionCustomFieldId) {
            switch (field.type) {
              case FeildType.MultiSelection: {
                field.lookupValues.forEach((item, index) => {
                  field.lookupValues[index].isSelected = false;
                });
                valueObject.value.split(',').forEach(val => {
                  field.lookupValues.forEach(lookupVal => {
                    if (lookupVal.id == parseInt(val)) {
                      lookupVal.isSelected = true;
                    }
                  });
                });
                break;
              }
              case FeildType.Money: {
                if (valueObject.value.indexOf(':') > -1) {
                  let moneyValues = valueObject.value.split(':');
                  field.value = moneyValues[0];
                  field.selectedCurrencyId = parseInt(moneyValues[1]);
                  field.selectedCurrencySymbol = moneyValues[4];

                }
                break;
              }
              case FeildType.LookupAddon: {
                //field.selectedLookupText = valueObject.selectedLookupText;
                field.value = valueObject.value;
                break;
              }
              case FeildType.Attachment: {
                //field.details = valueObject.details;
                field.value = valueObject.value;
                break;
              }
              default: {
                field.value = valueObject.value;
                break;
              }
            }
          }
          field.actionValue = field.value;
        });
      });

    return customFields;
  }

  public static mapCurrencyWithThreeValues(field: CustomFieldModel) {
    if (field.value && field.value.indexOf(':') > -1) {
      let values: string[] = [];
      values = field.value.split(':');
      if (values[0]) {
        field.value = values[0]
      }
      if (values[1]) {
        field.selectedCurrencyId = +values[1];
      }
      if (values[2]) {
        field.selectedCurrencySymbol = values[2];
      }
    }
  }

  public fieldHasTag(value: string): boolean {
    if (value && value.toString().indexOf('#') > -1 && value.toString().indexOf('{') == 0 && value.toString().lastIndexOf('}') == value.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  public static removeHyphensAllowNumbers(event:any, value: string) {
    var k;
    k = event.keyCode;
    if (event.keyCode == 46 && value && value.toString().indexOf('.') >= 0) {//46 is for . allow only one .
      return false;
    }
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57) || k == 46);
  }

  setSelectedCurrenciesString(customField: CustomFieldModel, currenciesList: CurrencyModel[] = []) {
    let selectedCurrenciesString = "";
    let allowedValuesCriteriaArray: string[] = customField.allowedValuesCriteria.split(",");
    allowedValuesCriteriaArray.forEach(function (num) {
      currenciesList.forEach(function (currency) {
        if (currency.id == parseInt(num) && customField.value != num)
          selectedCurrenciesString += currency.code + ", ";
      });
    });

    customField.selectedCurrenciesString = selectedCurrenciesString.slice(0, -2);
  }

  setDefaultCurrencyString(customField: CustomFieldModel, currenciesList: CurrencyModel[] = []) {
    let defaultCurrencyString = "";
    let allowedValuesCriteriaArray: string[] = customField.allowedValuesCriteria.split(",");
    currenciesList.forEach(function (currency) {
      if (String(currency.id) == customField.value) {
        defaultCurrencyString = currency.code;

        if (customField.allowedValuesCriteria.split(",").length > 1) {
          defaultCurrencyString += ", ";
        }
      }
    });

    customField.defaultCurrencyString = defaultCurrencyString;
  }

  getSelectedCurrenciesString(customField: any, currenciesList: CurrencyModel[]) {
    let selectedCurrenciesString = "";
    let allowedValuesCriteriaArray: string[] = customField.allowedValuesCriteria.split(",");
    allowedValuesCriteriaArray.forEach(function (num) {
      currenciesList.forEach(function (currency) {
        if (currency.id == parseInt(num) && customField.value != num)
          selectedCurrenciesString += currency.code + ", ";
      });
    });

    return selectedCurrenciesString.slice(0, -2);
  }

  getDefaultCurrencyString(customField: any, currenciesList: CurrencyModel[]) {
    let defaultCurrencyString = "";
    let allowedValuesCriteriaArray: string[] = customField.allowedValuesCriteria.split(",");
    currenciesList.forEach(function (currency) {
      if (String(currency.id) == customField.value) {
        defaultCurrencyString = currency.code;

        if (customField.allowedValuesCriteria.split(",").length > 1) {
          defaultCurrencyString += ", ";
        }
      }
    });

    return defaultCurrencyString;
  }
}
