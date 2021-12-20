export class UserResult {
  constructor(

  ) { }

  public id: number;
  public organizationId: number;
  public organizationName: string
  public fullName: string;
  public isOrganizationAdmin: boolean;
  public pictureUrl: string;
  public status: UserStatus;
  public statusChangeDatetime: Date;
  public email: string;
  public invitationCode: string;
  public role: UserRole;
}

export class NameId {
  constructor(

  ) { }

  public id: number;
  public name: string;
}

export enum UserStatus {
  Active,
  Deactivated,
  InvitationSent,
  InvitationCanceled
}

export enum UserRole {
  Admin = 1,
  User = 2,
}
