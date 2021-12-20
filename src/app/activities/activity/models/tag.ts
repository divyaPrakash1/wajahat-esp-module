import { User } from "./user";

export class Tag {
  id: number;
  text: string;
  color: string;
  organizationId: number;
  // organization:Organization;
  createdBy_UserId: number;
  createdBy: User;
  isDeleted: boolean;
  creationDate: Date;
  isChecked: boolean;
  constructor() {}
}
