import { User } from "./user";
import { Input } from "@angular/core";
import { AllowedAction } from "./allowed-action";

export class Comment {
  id: number;
  text: string;
  createdBy_UserId: number;
  createdBy: {
    FirstName: string;
    LastName: string;
    UserProfilePictureUrl: string;
  };
  creationDate: string;
  // expectationId?: number;
  // tacticId?: number;
  // checkPointId?: number;
  // riskId: number;
  // organizationId: number;
  // keyResultId: number;
  // measureId: number;
  // keyPointId: number;
  allowedActions: AllowedAction[];
  constructor() {}
}
