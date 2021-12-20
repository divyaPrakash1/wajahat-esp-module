import { CustomFieldValueModel } from "./custom-field-value-model-activity";

export class SectionValuesModel {
  constructor() {
    this.id = 0;
    this.instances = [];
  }
  public id: number;
  public instances: SectionValueInstanceModel[];
}

export class SectionValueInstanceModel {
  constructor() {
    this.values = [];
  }
  public values: CustomFieldValueModel[];
}
