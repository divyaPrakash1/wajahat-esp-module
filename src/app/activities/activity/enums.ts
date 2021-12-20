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
  Shared = 4,
  Closed = 5,
  Signed = 6,
  Rejected = 7
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
  reject = 12, // reject
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
  expandDueDate=24,
  sign = 25,
  revoke = 26,
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

export enum CentralizedActivity {
  SourceSystemId = 'sourceSystemId',
  SourceTenantId = 'sourceTenantId',
  SourceObjectTypeId = 'sourceObjectTypeId',
  SourceObjectId = 'sourceObjectId'
}

export enum SourceSystem {
  SimpleStrata	= '0',
  Esp = '1',
  EngPro = '2',
  OppPro = '3',
  Epm = '4',
  Plannexe = '5'
}

export enum DataProviderSourceSystem {
  SimpleStrata	= '0',
  Esp = '4',
  EngPro = '1',
  OppPro = '2',
  Epm = '3',
  Plannexe = '5'
}