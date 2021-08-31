import { User } from "./user";
import { AllowedAction } from "./allowed-action";

import { Tag } from "./tag";

export class CheckPoint {
  constructor() {}
  id!: number;
  title!: string;
  startDate!: Date;
  dueDate!: Date;
  status!: number;
  teamId!: number;
  // team: Team;
  createdBy_userId!: number;
  createdBy!: User;
  assignedBy_UserId!: number;
  assignedBy!: User;
  parentName!: string;
  creationDate!: Date;
  score!: number;
  scoreCached!: number;
  indicatorCount!: number;
  allowedActions!: AllowedAction[];
  labelGroupId!: number;
  owner_UserId!: number;
  userOwner!: User;
  indicatorTargetValue!: number;
  indicatorActualValue!: number;
  fieldCount!: number;
  signatureCount!: number;
  hasLoggedInUserSign!: boolean;
  isSigned!: boolean;
  attachmentCount!: number;
  ratedIndicatorCount!: number;
  relationCount!: number;
  commentCount!: number;
  isLocked!: boolean;
  tags!: Tag[];
}
