import { CustomFieldModel } from "./CustomFieldModel";

export class CommonFieldModel extends CustomFieldModel {
  public assignmentDetails!: CommonCustomFieldDetail[];
  public isExpanded!: boolean;
}

export class CommonCustomFieldDetail {
  public customFieldId!: number;
  public definitionName!: string;
  public definitionCreatedOn!: Date;
  public stageName!: string;
  public criteriaName!: string;
  public templateLabel!: string;
  public templateCreatedOn!: Date;
}
