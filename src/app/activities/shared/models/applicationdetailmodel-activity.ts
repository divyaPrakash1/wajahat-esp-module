import { ApplicationDefinition } from '../../shared/models/application-definition-activity'
import { CustomFieldValueModel, ValueDetails } from './custom-field-value-model-activity';
import { SectionValuesModel } from './section-values-activity';
import { ProfilePicStatus } from '../../shared/enums/profile-pic-status.enum-activity';
import { UserResult } from './UserResult-activity';


export class ApplicationDetail extends ApplicationDefinition {

  constructor() {
    super();
  }

  applicationId: number;
  applicationNumber: string;
  applicationStatus: string;
  applicationStatusId: number;
  applicationCompletedOn?: Date;
  applicationCreatedDate: Date;
  applicationSubmittedDate: Date;
  applicantName: string;
  applicantId: number;
  currentStageId: number;
  formValues: CustomFieldValueModel[];//Obsolete
  sectionValues: SectionValuesModel[];
  allowSubmission: boolean;

  definitionName: string;
  submittedOn: Date;
  status: string;

  pendingFor: string;
  applicationClass: string;
  parentApplicationName: string;
  isSigned: boolean;
  permissions: string[];
  isMySubmitted: boolean;
  applicantPictureStatus: ProfilePicStatus;
  summary: ApplicationSummary;
  formResubmitEnabled: boolean;

  mainApplicationId: number;
  applicationCreatedBy?: string;
}

export class LinkDefinition {
  linkDefinitionId: number;
  linkDefinitionNameCustomFieldId: number;
  linkDefinitionSectionId: number;
  linkDefinitionCanApplyMultiple: boolean;
  ApplicationId: number;
  linkDefinitionName: string;
  pendingLinkApplications: number;
  acceptedLinkApplications: number;
  rejectedLinkApplications: number;
  isSubmissionAllowed: boolean;
  submitLabel: string;
  canISubmit: boolean;
  allowedUsers: UserResult[] = [];
}

export class ParentApplicationInfo {
  applicationId: number;
  applicationsCount: number;
  mainApplicationNumber: string;
  submittedBy: string;
  submittedOn: Date;
  definitionName: string;
  applicantEmail: string;
}

export class RespondModel {
  applicationId: number;
  assessmentId: number;
  isAccepted: boolean;
  comments: string;
  stageId: number;
  public values: CustomFieldValueModel[];//obsolete
  public sectionValues: SectionValuesModel[];
  constructor() {
  }
}

export class CommentModel {
  assessmentId: number;
  comment: string;
  createdOn: Date;
  fullName: string;
  id: number;
  imageUrl: string;
  isVisibletoApplicant: boolean;
  userId: number;
  commentUserId: number = 0;
  attachments: ValueDetails[];
  constructor() {
  }

}

export class AddCommentModel {

  assessmentId: string;
  comment: string;
  isVisibletoUser: boolean;

  constructor() {
  }
}

export class ApplicationSummary {
  name: string;
  title: string;
  isMine: boolean;
  isFeed: boolean;
  cardValues: LabelValue[];
}

export class LabelValue {
  label: string;
  value: string;
}
