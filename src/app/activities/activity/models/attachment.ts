import { User } from "./user";
import { AllowedAction } from "./allowed-action";

export class Attachment {
  id: number;
  createdBy_UserId: number;
  createdBy: User;
  creationDate: Date;
  name: string;
  fileUrl: string;
  fileType: number;
  sizeInKB: number;
  allowedActions: AllowedAction[];
  constructor() {}
}
