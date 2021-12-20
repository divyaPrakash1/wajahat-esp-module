import { AdminApplicationViewModel } from "../../shared/models/application-view-model-activity";
import { UserResult } from "./UserResult-activity";

export class FolderDefinition{
  definitionId: number;
  definitionName: string;
  submitLabel: string;
  applications: AdminApplicationViewModel[];
  canISubmit: boolean;
  allowedUsers: UserResult[] = [];

  openApplications: AdminApplicationViewModel[]; // only for view
}
