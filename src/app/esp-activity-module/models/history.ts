import { User } from "./user";

export class History {
  action!: any;
  changeDate!: string;
  changeTime!: string;
  fieldName!: string;
  fieldType!: number;
  newValue!: string;
  originalValue!: string;
  user!: User;
  userId!: number;
  constructor() {}
}
