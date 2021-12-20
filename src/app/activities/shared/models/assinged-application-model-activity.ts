import { AssingedApplicationType } from '../../shared/enums/assinged-application-type.enum-activity';

export class AssinedApplicationModel{
  id: number;
  applicantName: string;
  category: string;
  categoryId: number;
  definitionName: string;
  applicationNumber: string;
  submittedOn: Date;
  startedOn: Date;
  statusId: number;
  pendingWith: string[];
  applicantId: number;
  isOverDue: boolean;
  isSigned: boolean;
  type: AssingedApplicationType;
  numberOfSubmissions: number;
  parentApplicationId: number;
  parentDefinitionName: string;
  isMySubmitted: boolean;
}

