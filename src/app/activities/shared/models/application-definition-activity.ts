import { DefinitionStageModel } from "./definition-stage-activity";
import { FormSectionModel } from "../../shared/models/CustomizationSettingsSubmitModel-activity";
import { ParentApplicationInfo } from "../../shared/models/applicationdetailmodel-activity";
import { ActionModel } from "../../shared/models/action-model-activity";
import { TriggerModel } from "../../shared/models/trigger-model-activity";

export class ApplicationDefinition {
  constructor() {
    this.type = DefinitionType.Default;
    this.stages = [];
    this.category = "";
    this.permissions = [];
  }
  public createdOn: Date;
  public name: string;
  public description: string;
  public nameUI: string;
  public descriptionUI: string;
  public id: number;
  public isActive: boolean;
  public visible: boolean;
  public isPublished: boolean;
  public publishedVersion: number;
  public typeId: number;
  public category: string;
  public version: number;
  public criteriaCount: number;
  public actions: ActionModel[];
  public triggers: TriggerModel[];
  public stages: DefinitionStageModel[];
  public form: FormModel;
  public iconName: string;
  public color: string;
  public descriptionLength: number;
  public isProfileCompletionRequired: boolean;
  public key: string;
  public referenceApplicationId: number;
  public isprofileCompleted: boolean;
  public profileTemplateId: number;
  public profileTemplate: string;
  public delegationsCount: number;
  public type: DefinitionType;
  public parentApplicationId: number;
  public stageVisibilityApplicant: string;
  public stageVisibilityApplicantText: string;
  public linkDefinitionNameCustomFieldId: number;

  public parentApplicationInfo: ParentApplicationInfo;
  public startDate: Date;
  public endDate: Date;
  public isSubmission: boolean;

  public expandApplicationAction: boolean;

  public applicationId: number;
  public permissions: string[];
}

export enum DefinitionType {
  Default = "DEFAULT",
  Link = "LINK",
  SUBMISSION = "SUBMISSION_REQUEST",
}

export class FormModel {
  constructor() {
    this.id = 0;
    this.sections = [];
    this.sections.push(new FormSectionModel());
  }
  public id: number;
  public isExpended: boolean = false;
  public sections: FormSectionModel[];
  public isValid?: boolean = false;
  public submitLabel?: string;
  public cancelLabel?: string;
}
