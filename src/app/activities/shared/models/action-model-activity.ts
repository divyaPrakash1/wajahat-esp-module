import { ConstraintModel } from './trigger-model-activity';

export class ActionModel {
  constructor() {
    this.values = [];
  }
  public id: number;
  public name: string;
  public type: string;
  public trigger: string;
  public actionTrigger: string;
  public isDeleted: boolean;
  public isEnabled: boolean;
  public values: ActionValue[];

  public lookupAddonId: number;
  public emailTo: string;
  public subject: string;
  public body: string;
  public constraint: ConstraintModel;
  public filters: string; //Used for filters as json string

  public jumpStageId: number;
}

export class ActionValue {
  public id: number;
  public value: string;
  public actionKey: string;
}

export class ActionType {
  readonly Email = "Email";
  readonly CreateLookupItem = "CreateLookupItem";
  readonly UpdateLookupItem = "UpdateLookupItem";
  readonly JumpStage = "JumpStage";
  readonly CloseApplicationAsAccepted = "CloseApplicationAsAccepted";
  readonly CloseApplicationAsRejected = "CloseApplicationAsRejected";
}

export class ActionTriggerType {
  readonly OnStageStart = "OnStageStart";
  readonly OnStageEnd = "OnStageEnd";
  readonly OnStageAccepted = "OnStageAccepted";
  readonly OnStageRejected = "OnStageRejected";
}
export class DefinitionActionTriggerType {
  readonly OnApplicationAccepted = "OnApplicationAccepted";
  readonly OnApplicationRejected = "OnApplicationRejected";
}


