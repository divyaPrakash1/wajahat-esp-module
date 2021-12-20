import {Profile} from '../../shared/models/profile-activity.model';

export interface IMember {
  EntityType: string;
  Idenedi: string;
  ScoreInGroup: number;
  SharedCards: string[];
  IsMemberHidden: boolean;
  IdenediType: IdenediType; 

  ModifiedOn: Date;
  PresenceInfo: PresenceInfo;
  Profile: Profile; 
  Records: Record[];
  UserTitles: UserTitle[];
  TitleInGroup: string;
}

interface GroupApp {
  GlobalApp: string | null,
  AppName: string,
  Description: string,
  PlayStoreLink: string,
  AppleAppStoreLink: string,
  AppDownloadLink: string,
  FirebaseKeyJsonFile: string,
  IsGlobal: boolean
}

interface IGroupDetail {

  ContractIds: string[];
  IsAdmin: boolean;

  GroupMembershiptStatusChangedOn: Date;
  GroupMembershipStatus: GroupMembershipStatus;
  GroupSettings: GroupSettings;
  GroupSummary: GroupSummary;
}

export class GroupDetail implements IGroupDetail, IMember {
  // Common properties
  EntityType: string;
  Idenedi: string;
  ScoreInGroup: number;
  SharedCards: string[];
  IsMemberHidden: boolean;
  IdenediType: IdenediType;

  ModifiedOn: Date;
  PresenceInfo: PresenceInfo;
  Profile: Profile;
  Records: Record[] = [];
  UserTitles: UserTitle[] = [];
  TitleInGroup = '';

  // Group properties
  onlyMeGroup = false; // this is not coming from server. it is for local use
  key: number; // this is not coming from server. it is for local use
  ContractIds: string[];
  IsAdmin: boolean;
  GroupMembershipStatus: GroupMembershipStatus;

  ContactInfoReqeusts: any; // Need to check type
  Expiration: any;  // Need to check type
  GroupAdminRoles: any; // Need to check type
  IsGroupMembersSyncEnabled: boolean;
  LastContactInfoRequestedOn: any; // Need to check type
  NumberOfPendingContracts: number; // Need to check type
  SeenAnnouncements = 0;
  SeenPublicAnnouncements = 0;
  UnseenAnnouncements: number;
  UnseenPublicAnnouncements: number;
  MergedSeenAnnouncements: number;
  MergedTotalAnnouncements: number;
  MergedUnseenAnnouncements: number;

  GroupMembershiptStatusChangedOn: Date;
  GroupSettings: GroupSettings;
  GroupSummary: GroupSummary;
  GroupSearchResult: GroupSearchResult;

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      if (prop != 'ModifiedOn'
        && prop != 'PresenceInfo'
        && prop != 'Profile'
        && prop != 'Records'
        && prop != 'UserTitles'
        && prop != 'GroupMembershiptStatusChangedOn'
        && prop != 'GroupSettings'
        && prop != 'GroupSummary') {
        this[prop] = detail[prop];
      }
    }

    this.ModifiedOn = new Date(detail.ModifiedOn);
    this.PresenceInfo = new PresenceInfo(detail.PresenceInfo);
    this.Profile =
      new Profile(detail.Profile, this.IdenediType == IdenediType.Group);

    if (detail.Records) {
      for (const r of detail.Records) {
        this.Records = [...this.Records, new Record(r)];
      }
    }

    if (detail.UserTitles) {
      for (const title of detail.UserTitles) {
        this.UserTitles = [...this.UserTitles, new UserTitle(title)];
      }
    }

    if (this.IdenediType == IdenediType.Group) {
      // This is shit!
      // If GroupMembershipStatus is null then its followed
      // If GroupMembershipStatus is undefined then its not followed (O_O)
      if (detail.GroupMembershipStatus == null) {
        this.GroupMembershipStatus = GroupMembershipStatus.None;
      }
      if (detail.GroupMembershiptStatusChangedOn) {
        this.GroupMembershiptStatusChangedOn =
          new Date(detail.GroupMembershiptStatusChangedOn);
      } else {
        this.GroupMembershiptStatusChangedOn =
          new Date('1990-06-11T12:57:13.4398688Z');
      }
      if (detail.GroupSettings) {
        this.GroupSettings = new GroupSettings(detail.GroupSettings);
      } else {// This is on satggin for corrupted data. On production groupsetting will always be available
        this.GroupSettings = new GroupSettings();
        console.log('No groups settings for : ' + this.Idenedi);
      }
      this.GroupSummary = new GroupSummary(detail.GroupSummary);
    }
  }
}

export class PresenceInfo {
  EntityType: string;
  Message: string;
  Status: PresenceInfoStatus;

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      this[prop] = detail[prop];
    }
  }
}

export class UserTitle {
  GroupIdenedi: string;
  GroupName: string;
  GroupScore: number;
  RecordInstanceIds: string[];

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      this[prop] = detail[prop];
    }
  }
}

export class GroupRequester {
  InstanceId: string;
  RecievedOn: Date;
  RequesterInformation: GroupDetail;

  constructor(detail?: any) {
    this.InstanceId = detail.InstanceId
    this.RequesterInformation = new GroupDetail(detail.RequesterInformation);
    this.RecievedOn = new Date(detail.RecievedOn);
  }
}

export class GroupSearchResult {
  JoinByInviteOnly: boolean;
  MembershipOptionData: string[];
  PublicRecords: Record[];

  constructor() {

  }
}

export class GroupSummary {
  CreatedBy: string;
  EntityType: string;
  NumberOfAdmins = 0;
  NumberOfContractTemplates = 0;
  NumberOfMembers = 0;
  SubGroupIds: string[];
  TotalAnnouncements = 0;
  TotalPublicAnnouncements = 0;
  UserIdenedi: string;
  LastAnnouncementMadeOn: Date;

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      if (prop !== 'LastAnnouncementMadeOn') {
        this[prop] = detail[prop];
      }
    }

    if (detail.LastAnnouncementMadeOn) {
      this.LastAnnouncementMadeOn = new Date(detail.LastAnnouncementMadeOn);
    } else {
      this.LastAnnouncementMadeOn = new Date('1980-06-11T12:57:13.4398688Z');
    }
  }
}

export class Record {
  CardShareKey: string;
  CachedInfo: {
    Profile: {
      FirstName: string,
      LastName: string,
      ProfileImageUrl: string,
      CountryISOCode: string,
      IsChildAccount: boolean,
      InstanceId: string,
      EntityType: string
    },
    Title: null | string,
    Records: Record[]
  };
  Label: string;
  Type: string;
  Value: string;
  InstanceId: string;
  EntityType: string;
  UserIdenedi: string;
  CountryISOCode: string;
  PartOfCards: string[];

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      this[prop] = detail[prop];
    }
  }
}

export class GroupSettings {
  EntityType: string;
  GroupAnnouncers: GroupAnnouncers;
  GroupMembershipEmailAddressDomains: string[] = [];
  GroupJoinByInvitationOnly = false;
  UserIdenedi: string;
  ShowMembersScore: boolean;
  HideNumberOfMembers: boolean;
  GroupMembershipOption: GroupMembershipOption = GroupMembershipOption.AdminApprovalRequired;
  GroupVisibility: GroupVisibility;
  MemberListVisibility: MemberListVisibility;
  GroupApp: GroupApp;

  constructor(detail?: any) {
    if (!detail) {
      return;
    }
    for (const prop in detail) {
      this[prop] = detail[prop];
    }
  }
}

// *************************************
//  ENUMS
// *************************************

export enum PresenceInfoStatus {
  Available = 'Available'
}

export enum GroupMembershipOption {
  JoinByEmailAddressDomain = 'JoinByEmailAddressDomain',
  AdminApprovalRequired = 'AdminApprovalRequired',
  AnyoneCanJoin = 'AnyoneCanJoin',
  OnlyAdminCanAdd = 'OnlyAdminCanAdd',
  ValidContractRequired = 'ValidContractRequired'
  // ADD MORE here
}

export enum MemberListVisibility {
  MembersOnly = 'MembersOnly',
  AdminOnly = 'AdminOnly',
  Public = 'Public'
}

export enum GroupVisibility {
  Searchable = 'Searchable',
  Hidden = 'Hidden',
  Incognito = 'Incognito'
}

export enum GroupVisibilityStatus {
  Secret = 1,
  Private = 2,
  Public = 3,
  Incognito = 4
}

export enum GroupMembershipStatus {
  RequestPending = 'RequestPending',
  InActive = 'InActive',
  None = 'None',
  Admin = 'Admin',
  Member = 'Member'
}

export enum IdenediType {
  Individual = 'Individual',
  Group = 'Group'
}

export enum GroupAnnouncers {
  AdminsOnly = 'AdminsOnly',
  AllMembers = 'AllMembers'
}
