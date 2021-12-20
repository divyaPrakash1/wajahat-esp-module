export enum ApplicationStatus {
  All = 'All',
  New = 'New',
  Invited = 'Invited',
  UnderProcess = 'Under Process',
  Rejected = 'Rejected',
  Approved = 'Approved',
  Pending = 'Pending',
  Accepted = 'Accepted',
  Cancelled = 'Cancelled'
}

export enum ApplicationStatusPost {
  All = 0,
  New = 1,
  Pending = 2,
  Accepted = 3,
  Rejected = 4,
  Cancelled = 5,
  
}

export enum AdminApplicationStatus {
  All = "All",
  PendingAction = "Pending Action",
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Open = 'Open',
  Closed = 'Closed',
  None = 'None'
}

export enum AdminApplicationStatusPost {
  All,
  PendingAction
}

export enum ApplicationStatuses {
  Invited = 0,
  New = 1,
  Pending = 2,
  Accepted = 3,
  Rejected = 4,
  Cancelled = 5
}

export enum ApplicationClasses {
  Draft = 'draft',
  Invited = 'invited',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  New = 'new'
}

export enum StageStatus {
  Accepted = 1,
  Rejected = 2
}
