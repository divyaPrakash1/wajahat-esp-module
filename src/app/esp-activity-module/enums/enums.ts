export enum StemeXeGroupType {
  None = 0,
  DueDate = 1,
  Project = 2,
  Week = 3,
  People = 4,
  Graph = 5,
}
export enum StemeXeListType {
  Mine = 0,
  Following = 1,
  Backlog = 2,
  User = 3,
  Shared=4
}

export enum ActiveTab {
  Mine = 'Mine',
  Following = 'Following',
  Backlog = 'Backlog',
  User = 'User',
  Shared= 'Shared',
  Details= 'Details'
}

export enum FileType {
  jpg = 0,
  jpeg = 1,
  png = 2,
  gif = 3,
  doc = 4,
  docx = 5,
  xls = 6,
  xlsx = 7,
  pdf = 8,
  mp3 = 9,
  wav = 10,
  mp4 = 11,
  xwav = 12,
  ppt = 13,
  pptx = 14,
}

export enum Definitions {
  Sum = 1,
  Average = 2,
  Last = 3,
}

export enum Conditions {
  LessThan = 1,
  MoreThan = 2,
  Equal = 3,
}

export enum EntityTypes {
  Expectation = 0,
  Goob = 1,
  Tactic = 2,
  CheckPoint = 3,
  KeyPoint = 4,
  KeyResult = 5,
  Measure = 6,
  Indicator = 7,
  Organization = 8,
  Team = 9,
  Risk = 10,
}

export enum Actions {
  read = 0,
  create = 1,
  edit = 2,
  delete = 3,
  completeActivity = 4,
  cancelActivity = 5,
  sendReminder = 6,
  logActual = 7,
  close = 8,
  reopen = 9,
  approve = 10,
  reassign = 11,
  reject = 12,
  accept = 13,
  plan = 14,
  unplan = 15,
  share=16,
  claim=17,
  stopClaim=18,
  cancleClaim=19,
  completeClaim=20,
  decideLater=21,
  doToday=22,
  schedule=23,
  expandDueDate=24
}

export enum BackendAllowedActions {
  read = 0,
  create = 1,
  update = 2,
  delete = 3,
  append = 4,
  specialRight = 5,
}

export enum Status {
  Deleted = -1,
  Inactive = 0,
  Active = 1,
  Done = 2,
  Cancelled = 4,
  InProgress = 5,
  Open = 6,
  StemeXeApproved = 10,
  StemeXeRejected = 11,
  NotStarted =12
}

export enum SubTypeEnum {
  TOPIC,
  REQUEST,
  DASHBOARD
}

export enum ProfilePicStatus {
  NotUploaded = 'NoPicture',
  Uploaded = 'Uploaded',
  Verified = 'Verified',
  UnVerified = 'UnVerified'
}

export enum ApplicantSectionType {
  Editable = 1,
  ViewOnly = 2,
  Hidden = 3
}

export enum CriteriaPermission {
  Reassign = 'Reassign',
  AskQuestion = 'AskQuestion',
  ReturnStage = 'ReturnStage' //only used at frontend
}

export enum SignatureType {
  Font = 'Font',
  Draw = 'Draw',
  Upload = 'Upload'
}

export enum FeildType {
  All = 0,
  Text = 1,
  MultiLine = 2,
  Number = 3,
  DateTime = 4,
  SingleSelection = 5,
  MultiSelection = 6,
  Attachment = 7,
  Date = 8,
  Rating = 9, //remove this and check dependency
  Email = 10,
  Money = 11,
  Applicant = 12,
  LookupAddon = 13,
  SubApplication = 14,
  Hyperlink = 15,
  PhoneNumber = 16,
  RollUp = 17,
  SameLookupRollup = 100, //for frontend rollup use
  Calculated = 18,
  Mapped = 19,
  Note = 20
}

export enum TabKeyEnum {
  Profile = 'profile',
  Members = 'members',
  Feed = 'idenedi',
  Library = 'tlibrary',
  Calendar = 'tevents',
  Boards = 'isp',
  ContactCard = 'bcard',
  ScoreCard = 'Score Card',
  Requests = 'esp',
  Dashboards = 'kpowerbi',
  Activities = 'ss',
  Blog = 'blogs',
  Vacancies = 'higher',
  Messages = 'messages',
  Intajy = 'Intajy',
  Custom = 'custom'
}

export enum AssingedApplicationType{
  Feed = 'Feed',
  Application = 'Application'
}
