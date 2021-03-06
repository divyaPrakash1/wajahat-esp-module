import { ActionModel } from "./action-model";
import { StageCriteria } from "./stage-criteria";
import { ActionHistory, TriggerModel } from "./trigger-model";

export class DefinitionStageModel {
  constructor() {
    this.type =  StageType.Default;
    this.isExpended = false;
    this.actions = [];
    this.triggers = [];
    this.actionsHistory = [];
  }
  public id!: number;
  public name!: string;
  public criteriaCount!: number;
  public isAll!: boolean;
  public isEnabled!: boolean;
  public isSystem!: boolean;
  public applicationDefinationId!: number;
  public criteriaList!: StageCriteria[];
  public completedOn?: Date;
  public actions: ActionModel[];
  public triggers: TriggerModel[]; 
  public isExpended: boolean;
  public status!: string;
  public statusId!: number;
  public canAddSubApplicationField!: boolean;
  public linkDefinitionSectionId!: number;
  public linkDefinitionNameCustomFieldId!: number;
  public linkDefinitionId!: number;
  public linkDefinitionCanApplyMultiple!: boolean;
  public linkDefinitionInvitation: boolean = false;
  public type: StageType;
  public linkDefinitionName!: string;
  public isLinkDefinitionPublish: boolean = false;
  public linkDefDescription!: string;
  public actionsHistory: ActionHistory[]; 
  createdBy!: number;
  order!: number;
  totalWeight!: number;
  public isSigned?: boolean;
  public isLast?: boolean;
  public hasCriteriaToRespond?: boolean;
  public myActionRequired?: boolean;
}

export enum StageType {
  Default = "DEFAULT",
  Link = "LINK"
}
