import { DefinitionType } from "./application-definition";
import { ApplicationSummary } from "./applicationdetailmodel";
import { FormSectionValue } from "./custom-field-value-model";

export class ApplicationViewModel {
  constructor() {
  }
  id!: number;
  category!: string;
  definitionName!: string;
  applicationNumber!: string; 
  status!: string;
  submittedOn!: string;
  definitionVersion!: number;
  statusId!: number;
  definitionStartDate!: Date;
  definitionEndDate!: Date;
  definitionIsActive!: boolean;
  isMySubmitted!: boolean;
}

export class AdminApplicationViewModel extends ApplicationViewModel {
  applicantName!: string;
  assessedOn!: Date;
  createdOn!: Date;
  startedOn!: Date;
  applicationClass!: string;
  iconName!: string;
  stageStatuses: string[] = [];
  pendingFor!: string;
  isSigned!: boolean;
  formSectionValues!: FormSectionValue[];
  isExpanded!: boolean;
  pendingWith!: string[];
  applicationCompletedOn?: Date;
  definitionType!: DefinitionType;
  summary!: ApplicationSummary;
  mainApplicationId!: number;
}

