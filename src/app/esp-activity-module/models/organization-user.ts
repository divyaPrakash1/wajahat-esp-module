export class OrganizationUser {
  public email!: string;
  public fullName!: string;
  public id!: number;
  public invitationCode!: string;
  public isOrganizationAdmin!: Boolean;
  public organizationId!: number;
  public organizationName!: string;
  public pictureUrl!: string;
  public role!: number;
  public status!: number;
  public statusChangeDatetime!: Date;
  public delegatedToUserId: any;
  public addApplicant!: boolean;
  public isApplicant!: boolean;
  public profileTemplates!: number[];
  public isSelected!: boolean;
}
