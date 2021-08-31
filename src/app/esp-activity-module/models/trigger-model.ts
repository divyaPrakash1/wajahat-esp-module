import { ActionModel } from './action-model';

export class TriggerModel {
  constructor() {
    this.actions = [];
  }
  public id!: number;
  public actionTrigger!: string;
  public createdOn!: Date;
  public forObjecId!: number;
  public objectType!: TriggerObjectType;
  public isEnabled!: boolean;
  public actions: ActionModel[];
  public triggerConstraint!: ConstraintModel;
  public conditionsCount!: number;
  public conditionsFormatedText!: string;
}

export enum TriggerObjectType {
  OnStage = "OnStage",
  OnDefinition = "OnDefinition"
}

export class ConstraintModel {
  public id!: number;
  public conditions!: string;
}

export class ActionHistory {
  public name!: string;
  public type!: string;
  public trigger!: string;
  public executedDate: any;
  public status!: string;
  public actionStatus!: string;
}

export enum ActionStatus {
  Success = "Success",
  Pending = "Pending",
  Fail = "Fail"
}
