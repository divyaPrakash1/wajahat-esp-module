import { Activity } from "./activity";
import { AllowedAction } from "./allowed-action";
import { Week } from "./week";

export class ActivitiesByGroup {
  unsubscribe() {
    throw new Error("Method not implemented.");
  }
  constructor() {}

  userId: number;
  userFirstName: string;
  userLastName: string;
  userProfilePictureurl: string;
  userPosition: string;
  assignedCount: number;
  closedCount: number;
  notStartedCount: number;
  overdueCount: number;
  weekDays: {
    effortSum: number;
    effortSumHours: number;
    effortSumMinutes: number;
    days: {
      date: Date;
      effortSum: number;
      effortSumPercent: number;
    }[];
  };
  newAssigned: Activity[];
  newReported: Activity[];
  groups: {
    groupName: string;
    groupList: Activity[];
    groupCount: number;
    groupId: any,
    startDate:any,
    endDate: any,
    subType: any,
    isGroupExpanded: boolean,
    isGroupActivitiesLoading: boolean,
    pageIndex: number,
    isAllActivitiesLoaded:  boolean,
    isLoadingMore:  boolean,
    lastLoadedCount:number
  }[];
  ungrouped: Activity[];
  groupByPeople: {
    UserId: number;
    UserFirstName: string;
    UserLastName: string;
    UserProfilePictureUrl: string;
    AssignedCount: number;
    NotStartedCount: number;
    OverdueCount: number;
  }[];

  weeksGroup: {
    weeks: Week[];
    allowedActions: AllowedAction[];
  };
  sharedGroup:{
    ActivityCount: number;
    NotClaimedCount:  number;
    OverdueCount:  number;
  }
}
