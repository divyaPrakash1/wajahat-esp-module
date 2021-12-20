import { CommentModel } from '../../shared/models/applicationdetailmodel-activity';
import { FormModel } from './application-definition-activity';
import { CustomFieldValueModel } from '../../shared/models/custom-field-value-model-activity';
import { SignatureModel } from '../../shared/models/signature-activity.model';
import { CriteriaPermission } from '../../shared/enums/criteria-permission.enum-activity';
import { AdminApplicationViewModel } from '../../shared/models/application-view-model-activity';
import { SectionValuesModel } from '../../shared/models/section-values-activity';
export class StageCriteria {
  constructor(
  ) {
    this.isExpended = false;
    this.comments = [];
  }
  public id: number;
  public name: string;
  public ownerId: number;
  public ownerIdJobRole: number;
  public ownerIdUserLookupCustomFieldPath: string;
  public ownerName: string;
  public daysToComplete: number;
  public weight: number;
  public isExpended: boolean;
  public isSystem: boolean;
  public isEnabled: boolean;
  public form: FormModel;
  public formValues: CustomFieldValueModel[];
  public sectionValues?: SectionValuesModel[];
  assessmentId: number;
  assessmentStatus: string;
  assessedOnDate?: Date;
  comments: CommentModel[];
  isOwner: boolean;
  stageId: number;
  public isJumped?: boolean;

  public subApplicantId: number;
  public subDefinitionId: number;
  public subApplicationId: number;
  public type: string;
  public isDisabled: boolean;
  public delegatedToName: string;
  public reassignAssessments: boolean;
  public reminder: string;
  public approveText: string;
  public rejectText: string;
  public hasApplication: boolean;
  public customFieldsCount: number;
  public isSigned?: boolean;

  signature?: SignatureModel;
  permissions?: CriteriaPermission[];
  application?: AdminApplicationViewModel;
  isReturned?: boolean;
}

export class ReassignCriteriaOwner {
  public name: string;
}
