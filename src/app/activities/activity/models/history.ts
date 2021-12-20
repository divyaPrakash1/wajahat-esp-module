import { User } from "./user";

export class History {
  action: number;
  changeDate: string;
  fieldName: string;
  fieldType: number;
  newValue: string;
  originalValue: string;
  user: User;
  userId: number;
  constructor() {}
}
