import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
// import {
//   AuthType,
//   AUTH_TYPE_HEADER,
//   AuthService,
// } from "../../shared/services/auth.service";
import { Observable } from 'rxjs';
// import { StemeXeListType, StemeXeGroupType } from "../enums";

// import { environment } from "../../../../src/environments/environment";
// import { SimplestrataAuthService } from "../../../request/shared/services/simplestrata-auth.service";
import { promise } from 'protractor';
import { SimplestrataAuthService } from './simplestrata-auth.service';
import { StemeXeListType } from '../enums/enums';
import { AuthService, AuthType } from './auth.service';
import { environment } from '../../../environments/environment';
//import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _simpleStrataAuthService: SimplestrataAuthService
  ) {}


  getAllByWeeksForMine(engProLoggedInUserId?: string): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllByWeeksForMine`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    return this._http.get<any>(url, options);
  }
  getAllInWeekForMine(engProLoggedInUserId?: string): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllInWeekForMine`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    return this._http.get<any>(url, options);
  }
  getAllByWeeksForFollowing(
    userId: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/GetAllByWeeksForUser`
      : `api/IndicatorStemeXe/EngPro/GetAllByWeeksForUser`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    let data = {
      UserId: userId,
    };

    return this._http.post<any>(url, data, options);
  }
  getAllInWeekForFollowing(
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/GetAllInWeekForUser`
      : `api/IndicatorStemeXe/EngPro/GetAllInWeekForUser`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    return this._http.get<any>(url, options);
  }


  getCountForMine(
    keyword: string,
    groupType: number,
    pageSize?: number,
    pageIndex?: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetCountForMine`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number | undefined;
      PageSize: number | undefined;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      } else {
        data.CreatorIds = [];
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      } else {
        data.TeamIds = [];
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      } else {
        data.TacticIds = [];
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        TennantMapUrl: this._simpleStrataAuthService.oppProData.tennantMapUrl,
        CustomHeader: this._simpleStrataAuthService.oppProData.customHeader,
        AccessToken: oppProData.access_token,
      };
    }

    return this._http.post<any>(url, data, options);
  }
  getAllGroupsForMine(
    keyword: string,
    groupType: number,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllGroupsForMine`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
    };

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        TennantMapUrl: this._simpleStrataAuthService.oppProData.tennantMapUrl,
        CustomHeader: this._simpleStrataAuthService.oppProData.customHeader,
        AccessToken: oppProData.access_token,
      };
    }

    return this._http.post<any>(url, data, options);
  }
  getAllByGroupForMine(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllForMine`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      } else {
        data.CreatorIds = [];
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      } else {
        data.TeamIds = [];
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      } else {
        data.TacticIds = [];
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        TennantMapUrl: this._simpleStrataAuthService.oppProData.tennantMapUrl,
        CustomHeader: this._simpleStrataAuthService.oppProData.customHeader,
        AccessToken: oppProData.access_token,
      };
    }

    return this._http.post<any>(url, data, options);
  }


  getCountForFollowing(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetCountForFollowing`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        Module: 'OpportunityPro',
        ClientCode: environment.oppProClientCode,
        AuthToken: oppProData.authToken,
        CustomToken: oppProData.customToken,
        OrganizationToken: {
          FclJson: oppProData.organizationList[0].fclJson,
          UserIdentifier: oppProData.organizationList[0].userIdentifier,
          TennantCode: oppProData.organizationList[0].tennantCode,
          TennantName: oppProData.organizationList[0].tennantName,
          TennantMapUrl: oppProData.organizationList[0].tennantMapUrl,
          CustomHeader: oppProData.organizationList[0].customHeader,
          IdenediAccessToken: oppProData.organizationList[0].idenediAccessToken,
          IdenediRefreshToken:
            oppProData.organizationList[0].idenediRefreshToken,
          TenantIsMaster: oppProData.organizationList[0].tenantIsMaster,
          TenantIsChild: oppProData.organizationList[0].tenantIsChild,
        },
        // CustomJson:,
        // IdOfCurrentBoard:,
        // ActionItemToReturn:,
        // Params
      };
    }

    return this._http.post<any>(url, data, options);
  }
  getAllGroupsForFollowing(
    keyword: string,
    groupType: number,
    filter?: any,
    engProLoggedInUserId?: string
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllGroupsForFollowing`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
    } = {
      GroupType: groupType,
      Keyword: keyword,
    };

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }
    return this._http.post<any>(url, data, options);
  }
  getAllByGroupForFollowing(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllForFollowing`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        Module: 'OpportunityPro',
        ClientCode: environment.oppProClientCode,
        AuthToken: oppProData.authToken,
        CustomToken: oppProData.customToken,
        OrganizationToken: {
          FclJson: oppProData.organizationList[0].fclJson,
          UserIdentifier: oppProData.organizationList[0].userIdentifier,
          TennantCode: oppProData.organizationList[0].tennantCode,
          TennantName: oppProData.organizationList[0].tennantName,
          TennantMapUrl: oppProData.organizationList[0].tennantMapUrl,
          CustomHeader: oppProData.organizationList[0].customHeader,
          IdenediAccessToken: oppProData.organizationList[0].idenediAccessToken,
          IdenediRefreshToken:
            oppProData.organizationList[0].idenediRefreshToken,
          TenantIsMaster: oppProData.organizationList[0].tenantIsMaster,
          TenantIsChild: oppProData.organizationList[0].tenantIsChild,
        },
        // CustomJson:,
        // IdOfCurrentBoard:,
        // ActionItemToReturn:,
        // Params
      };
    }

    return this._http.post<any>(url, data, options);
  }

  getCountForShared(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetCountForShared`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        Module: 'OpportunityPro',
        ClientCode: environment.oppProClientCode,
        AuthToken: oppProData.authToken,
        CustomToken: oppProData.customToken,
        OrganizationToken: {
          FclJson: oppProData.organizationList[0].fclJson,
          UserIdentifier: oppProData.organizationList[0].userIdentifier,
          TennantCode: oppProData.organizationList[0].tennantCode,
          TennantName: oppProData.organizationList[0].tennantName,
          TennantMapUrl: oppProData.organizationList[0].tennantMapUrl,
          CustomHeader: oppProData.organizationList[0].customHeader,
          IdenediAccessToken: oppProData.organizationList[0].idenediAccessToken,
          IdenediRefreshToken:
            oppProData.organizationList[0].idenediRefreshToken,
          TenantIsMaster: oppProData.organizationList[0].tenantIsMaster,
          TenantIsChild: oppProData.organizationList[0].tenantIsChild,
        },
        // CustomJson:,
        // IdOfCurrentBoard:,
        // ActionItemToReturn:,
        // Params
      };
    }

    return this._http.post<any>(url, data, options);
  }
  getAllShared(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllShared`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    if (!!oppProData && isOppProEnabled) {
      data.OppProLogin = {
        Module: 'OpportunityPro',
        ClientCode: environment.oppProClientCode,
        AuthToken: oppProData.authToken,
        CustomToken: oppProData.customToken,
        OrganizationToken: {
          FclJson: oppProData.organizationList[0].fclJson,
          UserIdentifier: oppProData.organizationList[0].userIdentifier,
          TennantCode: oppProData.organizationList[0].tennantCode,
          TennantName: oppProData.organizationList[0].tennantName,
          TennantMapUrl: oppProData.organizationList[0].tennantMapUrl,
          CustomHeader: oppProData.organizationList[0].customHeader,
          IdenediAccessToken: oppProData.organizationList[0].idenediAccessToken,
          IdenediRefreshToken:
            oppProData.organizationList[0].idenediRefreshToken,
          TenantIsMaster: oppProData.organizationList[0].tenantIsMaster,
          TenantIsChild: oppProData.organizationList[0].tenantIsChild,
        },
        // CustomJson:,
        // IdOfCurrentBoard:,
        // ActionItemToReturn:,
        // Params
      };
    }

    return this._http.post<any>(url, data, options);
  }

  getCountForBacklog(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean,
    requestId?:any
  ): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/GetCountForBacklog`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.AccessToken,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
      ESP_RequestId?:any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
    }
    if(!!requestId){
      data.ESP_RequestId  = requestId;
    }

    return this._http.post<any>(url, data, options);
  }
  getAllByGroupForBacklog(
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean,
    requestId?:any
  ): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/GetAllForBacklog`; // api/IndicatorStemeXe/GetAllForBacklog
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.AccessToken,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
      ESP_RequestId?:any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
    }

    if(!!requestId){
      data.ESP_RequestId  = requestId;
    }
    return this._http.post<any>(url, data, options);
  }
  getAllGroupsForBacklog(
    keyword: string,
    groupType: number,
    filter?: any,
    engProLoggedInUserId?: string,
    oppProData?: any,
    isOppProEnabled?: boolean
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllGroupsForBacklog`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      Keyword: string;
      GroupType: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
    };

    if (!!filter) {
      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
    }

    return this._http.post<any>(url, data, options);
  }

  getAllForESPRequest(
    keyword: string,
    requestId:any,
    pageSize: number,
    pageIndex: number,
    filter?: any,
  ): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/GetAllForESPRequest`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken)
    };
    let data: {
      Keyword: string;
      ESP_RequestId:any;
      PageSize: number;
      PageIndex: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
    } = {
      ESP_RequestId:requestId,
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    return this._http.post<any>(url, data, options);
  }


  getCountForESPRequest(
    keyword: string,
    requestId:any,
    filter?: any,
  ): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/GetCountForESPRequest`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data: {
      Keyword: string;
      ESP_RequestId:any;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
    } = {
      ESP_RequestId:requestId,
      Keyword: keyword,
    };

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      //if (!!filter.IsImportant) {
      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';
      data.IsFollowed = filter.IsFollowed;
      //   }

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }



    return this._http.post<any>(url, data, options);
  }


  getStatsForESPRequest(
    // keyword: string,
    requestId:any,
    filter?: any,
  ): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/GetStatsForESPRequest`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data: {
      // Keyword: string;
      ESP_RequestId:any;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
    } = {
      ESP_RequestId:requestId,
      // Keyword: keyword,
    };

    // if (!!filter) {
    //   if (!!filter.CreatorIds) {
    //     data.CreatorIds = filter.CreatorIds;
    //   }
    //   if (!!filter.DueDate) {
    //     data.DueDate = filter.DueDate;
    //   }
    //   if (!!filter.StatusIds) {
    //     data.StatusIds = filter.StatusIds;
    //   }

    //   //if (!!filter.IsImportant) {
    //   filter.IsImportant == true ? data.IsImportant = filter.IsImportant : "";
    //   data.IsFollowed = filter.IsFollowed;
    //   //   }

    //   if (!!filter.TeamIds) {
    //     data.TeamIds = filter.TeamIds;
    //   }

    //   if (!!filter.TacticIds) {
    //     data.TacticIds = filter.TacticIds;
    //   }
    // }



    return this._http.post<any>(url, data, options);
  }

  UpdateDueDate(
    data: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/UpdateDueDate`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/UpdateDueDate`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,
    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };

    return this._http.post<any>(url, data, options);
  }



getCountForUser(
  id: string,
  keyword: string,
  groupType: number,
  pageSize: number,
  pageIndex: number,
  groupInfo?: any,
  filter?: any,
  engProLoggedInUserId?: string,
  isEngProActivity?: boolean
  //,
  // oppProData?: any,
  // isOppProEnabled?: boolean
): Observable<any> {
  const url = !isEngProActivity
    ? `api/IndicatorStemeXe/GetCountForUser`
    : `api/IndicatorStemeXe/EngPro/GetCountForUser`;
  const options = {
    headers: this._authService.buildAuthHeader(
      AuthType.SimpleStrata,
      !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
    ),
  };

  let data: {
    UserId: String;
    Keyword: string;
    GroupType: number;
    PageIndex: number;
    PageSize: number;
    CreatorIds?: Array<any>;
    DueDate?: any;
    StatusIds?: Array<any>;
    IsImportant?: any;
    IsFollowed?: any;
    TeamIds?: Array<any>;
    TacticIds?: Array<any>;
    OppProLogin?: any;
    GroupInfo?: any;
  } = {
    GroupType: groupType,
    Keyword: keyword,
    UserId: id,
    PageIndex: pageIndex,
    PageSize: pageSize,
  };

  if (!!groupInfo) {
    data.GroupInfo = {
      Id: groupInfo.groupId,
      StartDate: groupInfo.startDate,
      EndDate: groupInfo.endDate,
      Name: groupInfo.groupName,
      SubType: groupInfo.subType,
    };
  }

  if (!!filter) {
    if (!!filter.CreatorIds) {
      data.CreatorIds = filter.CreatorIds;
    }
    if (!!filter.DueDate) {
      data.DueDate = filter.DueDate;
    }
    if (!!filter.StatusIds) {
      data.StatusIds = filter.StatusIds;
    }

    filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';

    data.IsFollowed = filter.IsFollowed;

    if (!!filter.TeamIds) {
      data.TeamIds = filter.TeamIds;
    }

    if (!!filter.TacticIds) {
      data.TacticIds = filter.TacticIds;
    }
  }

  return this._http.post<any>(url, data, options);
}



  getAllByGroupForUser(
    id: string,
    keyword: string,
    groupType: number,
    pageSize: number,
    pageIndex: number,
    groupInfo?: any,
    filter?: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
    //,
    // oppProData?: any,
    // isOppProEnabled?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/GetAllForUser`
      : `api/IndicatorStemeXe/EngPro/GetAllForUser`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    let data: {
      UserId: String;
      Keyword: string;
      GroupType: number;
      PageIndex: number;
      PageSize: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
      OppProLogin?: any;
      GroupInfo?: any;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      UserId: id,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };

    if (!!groupInfo) {
      data.GroupInfo = {
        Id: groupInfo.groupId,
        StartDate: groupInfo.startDate,
        EndDate: groupInfo.endDate,
        Name: groupInfo.groupName,
        SubType: groupInfo.subType,
      };
    }

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';

      data.IsFollowed = filter.IsFollowed;

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    return this._http.post<any>(url, data, options);
  }

  getAllGroupsForUser(
    id: string,
    keyword: string,
    groupType: number,
    filter?: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = isEngProActivity
      ? `api/IndicatorStemeXe/EngPro/GetAllGroupsForUser`
      : `api/IndicatorStemeXe/GetAllGroupsForUser`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data: {
      UserId: String;
      Keyword: string;
      GroupType: number;
      CreatorIds?: Array<any>;
      DueDate?: any;
      StatusIds?: Array<any>;
      IsImportant?: any;
      IsFollowed?: any;
      TeamIds?: Array<any>;
      TacticIds?: Array<any>;
    } = {
      GroupType: groupType,
      Keyword: keyword,
      UserId: id,
    };

    if (!!filter) {
      if (!!filter.CreatorIds) {
        data.CreatorIds = filter.CreatorIds;
      }
      if (!!filter.DueDate) {
        data.DueDate = filter.DueDate;
      }
      if (!!filter.StatusIds) {
        data.StatusIds = filter.StatusIds;
      }

      filter.IsImportant == true ? data.IsImportant = filter.IsImportant : '';

      data.IsFollowed = filter.IsFollowed;

      if (!!filter.TeamIds) {
        data.TeamIds = filter.TeamIds;
      }

      if (!!filter.TacticIds) {
        data.TacticIds = filter.TacticIds;
      }
    }

    return this._http.post<any>(url, data, options);
  }

  getAllNewAssigned(
    keyword: string,
    pageIndex: number,
    pageSize: number,
    engProLoggedInUserId?: string
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllNewAssigned`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data = {
      PageIndex: pageIndex,
      Keyword: keyword,
      PageSize: pageSize,
    };

    return this._http.post<any>(url, data, options);
  }

  getAllNewReported(
    keyword: string,
    pageIndex: number,
    pageSize: number,
    engProLoggedInUserId?: string
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllNewReported`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    let data = {
      PageIndex: pageIndex,
      Keyword: keyword,
      PageSize: pageSize,
    };

    return this._http.post<any>(url, data, options);
  }

  getActivityDetails(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean,
    isEpmActivity?: boolean,
    parentProjectId?: boolean,
    taskId?:any
  ): Observable<any> {

    const url = !!isEpmActivity && isEpmActivity ? `${environment.mainURL}api/IndicatorStemeXe/EPM/GetDetails`:
    isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/EngPro/GetDetails`
      : `${environment.mainURL}api/IndicatorStemeXe/GetDetails`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,
    //     isEngProActivity && !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
    //   ),
    // };

    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data:any;
    if(!!isEpmActivity && isEpmActivity){
      data={
        TaskId:taskId,
        ParentProjectId:parentProjectId
      }
    }else{
      data = {
        Id: id,
      };
    }


    return this._http.post<any>(url, data, options);
  }

  acceptAssigned(
    id: number,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/AcceptAssigned`
      : `api/IndicatorStemeXe/EngPro/AcceptAssigned`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        isEngProActivity && !!engProLoggedInUserId
          ? engProLoggedInUserId.toString()
          : undefined
      ),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    let data = {
      Id: id,
    };
    return this._http.post<any>(url, data, options);
  }

  rejectAssigned(
    id: number,
    reason: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/RejectAssigned`
      : `api/IndicatorStemeXe/EngPro/RejectAssigned`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        isEngProActivity && !!engProLoggedInUserId
          ? engProLoggedInUserId.toString()
          : undefined
      ),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    let data = {
      Id: id,
      rejectionReason: reason,
    };
    return this._http.post<any>(url, data, options);
  }

  approveReported(
    id: number,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/ApproveReported`
      : `api/IndicatorStemeXe/EngPro/ApproveReported`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        isEngProActivity && !!engProLoggedInUserId
          ? engProLoggedInUserId.toString()
          : undefined
      ),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    let data = {
      Id: id,
    };
    return this._http.post<any>(url, data, options);
  }

  rejectReported(
    id: number,
    reason: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/RejectReported`
      : `api/IndicatorStemeXe/EngPro/RejectReported`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        isEngProActivity && !!engProLoggedInUserId
          ? engProLoggedInUserId.toString()
          : undefined
      ),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    let data = {
      Id: id,
      rejectionReason: reason,
    };
    return this._http.post<any>(url, data, options);
  }

  updateNotes(
    id: string,
    note: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/UpdateNote`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/UpdateNote`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };

    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };

    let data = {
      Id: id,
      Note: note,
    };
    return this._http.post<any>(url, data, options);
  }

  follow(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/Follow`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/Follow`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data = {
      Id: id,
    };

    return this._http.post<any>(url, data, options);
  }

  unfollow(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/Unfollow`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/Unfollow`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data = {
      Id: id,
    };

    return this._http.post<any>(url, data, options);
  }

  toggleImportant(
    id: string,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {

    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/ToggleImportant`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/ToggleImportant`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };

    let data = {
      Id: id,
    };

    return this._http.post<any>(url, data, options);
  }


  delete(
    activityId: string,
    actionId: number,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Indicator/DoAction`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/DoAction`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    let data = {
      Id: activityId,
      action: actionId,
    };
    return this._http.post<any>(url, data, options);
  }

  updateActualValue(
    data: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/Indicator/UpdateActualValue`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/UpdateActualValue`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    return this._http.post<any>(url, data, options);
  }

  create(data: any): Observable<any> {
    const url = `${environment.mainURL}api/IndicatorStemeXe/Create`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(AuthType.SimpleStrata),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    options.headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let form = new FormData();
    form.append('Description', data.Description);
    data.TargetValue != null
      ? form.append('TargetValue', data.TargetValue)
      : '';

    data.CalendarType!=null? form.append('CalendarType', data.CalendarType):'';
    data.CalendarEventId!=null? form.append('CalendarEventId', data.CalendarEventId):'';

    data.ActualValue != null
      ? form.append('ActualValue', data.ActualValue)
      : '';
    data.Unit != null ? form.append('Unit', data.Unit) : '';
    data.Condition != null ? form.append('Condition', data.Condition) : '';
    data.IsImportant != null
      ? form.append('IsImportant', data.IsImportant)
      : '';
    data.IsFollowed != null ? form.append('IsFollowed', data.IsFollowed) : '';
    data.TacticId != null ? form.append('TacticId', data.TacticId) : '';
    data.Owner_UserId != null
      ? form.append('Owner_UserId', data.Owner_UserId)
      : '';
    data.AssignedBy_UserId != null
      ? form.append('AssignedBy_UserId', data.AssignedBy_UserId)
      : '';
    form.append('DueDate', data.DueDate);
    // data.StartDate != null ? form.append("StartDate", data.StartDate) : "";
    data.ParentTeamId != null
      ? form.append('ParentTeamId', data.ParentTeamId)
      : '';

      data.ESP_RequestId != null
      ? form.append('ESP_RequestId', data.ESP_RequestId)
      : '';

      data.ESP_RequestNumber != null
      ? form.append('ESP_RequestNumber', data.ESP_RequestNumber)
      : '';
      data.ESP_RequestName != null
      ? form.append('ESP_RequestName', data.ESP_RequestName)
      : '';
      data.IsShared != null
      ? form.append('IsShared', data.IsShared)
      : '';
      // data.ShareWithIds != null
      // ? form.append("ShareWithIds", data.ShareWithIds)
      // : "";
      if (data.ShareWithIds != null && data.ShareWithIds.length > 0) {
        for (var i = 0; i < data.ShareWithIds.length; i++) {
          form.append('ShareWithIds[' + i + ']', data.ShareWithIds[i]);
        }
      }
      data.MaxClaims != null
      ? form.append('MaxClaims', data.MaxClaims)
      : '';
    data.Weight != null ? form.append('Weight', data.Weight) : '';
    data.Note != null ? form.append('Note', data.Note) : '';
    if (data.Effort !== null) {
      data.Effort.StartTime != null
        ? form.append('Effort.StartTime', data.Effort.StartTime)
        : '';
      data.Effort.EndTime != null
        ? form.append('Effort.EndTime', data.Effort.EndTime)
        : '';
      data.Effort.Hours != null
        ? form.append('Effort.Hours', data.Effort.Hours)
        : '';
      data.Effort.Minutes != null
        ? form.append('Effort.Minutes', data.Effort.Minutes)
        : '';
      data.Effort.CommentText != null
        ? form.append('Effort.CommentText', data.Effort.CommentText)
        : '';
      data.Effort.CompletedDate != null
        ? form.append('Effort.CompletedDate', data.Effort.CompletedDate)
        : '';
    }

    data.Files != null ? form.append('Files', data.Files) : '';

    return this._http.post<any>(url, form, options);
  }

  createRecurring(data: any): Observable<any> {
    const url = `api/IndicatorStemeXe/CreateRecurring`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.SimpleStrata),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    options.headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let form = new FormData();
    form.append('Description', data.Description);
    data.TargetValue != null
      ? form.append('TargetValue', data.TargetValue)
      : '';
    data.ActualValue != null
      ? form.append('ActualValue', data.ActualValue)
      : '';
    data.Unit != null ? form.append('Unit', data.Unit) : '';
    data.Condition != null ? form.append('Condition', data.Condition) : '';
    data.IsImportant != null
      ? form.append('IsImportant', data.IsImportant)
      : '';
    data.IsFollowed != null ? form.append('IsFollowed', data.IsFollowed) : '';
    data.TacticId != null ? form.append('TacticId', data.TacticId) : '';
    data.Owner_UserId != null
      ? form.append('Owner_UserId', data.Owner_UserId)
      : '';
    data.DueDate != null ? form.append('DueDate', data.DueDate) : '';
    data.RecurrenceStartDate != null ? form.append('RecurrenceStartDate', data.RecurrenceStartDate) : '';
    data.ParentTeamId != null
      ? form.append('ParentTeamId', data.ParentTeamId)
      : '';
      data.ESP_RequestId != null
      ? form.append('ESP_RequestId', data.ESP_RequestId)
      : '';

      data.ESP_RequestNumber != null
      ? form.append('ESP_RequestNumber', data.ESP_RequestNumber)
      : '';
      data.ESP_RequestName != null
      ? form.append('ESP_RequestName', data.ESP_RequestName)
      : '';
      data.IsShared != null
      ? form.append('IsShared', data.IsShared)
      : '';
      // data.ShareWithIds != null
      // ? form.append("ShareWithIds", data.ShareWithIds)
      // : "";


      if (data.ShareWithIds != null && data.ShareWithIds.length > 0) {
        for (var i = 0; i < data.ShareWithIds.length; i++) {
          form.append('ShareWithIds[' + i + ']', data.ShareWithIds[i]);
        }
      }
      data.MaxClaims != null
      ? form.append('MaxClaims', data.MaxClaims)
      : '';
    data.Weight != null ? form.append('Weight', data.Weight) : '';
    data.Note != null ? form.append('Note', data.Note) : '';
    if (data.Effort !== null) {
      data.Effort.StartTime != null
        ? form.append('Effort.StartTime', data.Effort.StartTime)
        : '';
      data.Effort.EndTime != null
        ? form.append('Effort.EndTime', data.Effort.EndTime)
        : '';
      data.Effort.Hours != null
        ? form.append('Effort.Hours', data.Effort.Hours)
        : '';
      data.Effort.Minutes != null
        ? form.append('Effort.Minutes', data.Effort.Minutes)
        : '';
      data.Effort.CommentText != null
        ? form.append('Effort.CommentText', data.Effort.CommentText)
        : '';
      data.Effort.CompletedDate != null
        ? form.append('Effort.CompletedDate', data.Effort.CompletedDate)
        : '';
    }

    data.Files != null ? form.append('Files', data.Files) : '';

    data.RecurrenceInterval != null
      ? form.append('RecurrenceInterval', data.RecurrenceInterval)
      : '';

    data.RecurrenceType != null
      ? form.append('RecurrenceType', data.RecurrenceType)
      : '';

    if (data.RecurrenceOnWeekDays != null && data.RecurrenceOnWeekDays.length > 0) {
      for (var i = 0; i < data.RecurrenceOnWeekDays.length; i++) {
        form.append('RecurrenceOnWeekDays[' + i + ']', data.RecurrenceOnWeekDays[i]);
      }
    }

    data.RecurrenceEndsOnDate != null
      ? form.append('RecurrenceEndsOnDate', data.RecurrenceEndsOnDate)
      : '';
    data.RecurrenceEndsAfterTimes != null
      ? form.append('RecurrenceEndsAfterTimes', data.RecurrenceEndsAfterTimes)
      : '';
    data.RecurrenceDistribution != null
      ? form.append('RecurrenceDistribution', data.RecurrenceDistribution)
      : '';


      if(data.RecurrenceOnMonthDate!= null){
        form.append('RecurrenceOnMonthDate.Date', data.RecurrenceOnMonthDate.Date);
        form.append('RecurrenceOnMonthDate.DateType', data.RecurrenceOnMonthDate.DateType);
      };

      if(data.RecurrenceOnMonthDay!= null){
        form.append('RecurrenceOnMonthDay.WeekDay', data.RecurrenceOnMonthDay.WeekDay);
        form.append('RecurrenceOnMonthDay.WeekDayOccurrence', data.RecurrenceOnMonthDay.WeekDayOccurrence);
      };


    return this._http.post<any>(url, form, options);
  }

  getRecurringResults(data: any,engProLoggedInUserId:any): Observable<any> {
    const url = `api/IndicatorStemeXe/GetRecurringResults`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : null
      ),
    };


    return this._http.post<any>(url, data, options);
  }

  update(
    data: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `${environment.mainURL}api/IndicatorStemeXe/Update`
      : `${environment.mainURL}api/IndicatorStemeXe/EngPro/Update`;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     isEngProActivity && !!engProLoggedInUserId
    //       ? engProLoggedInUserId.toString()
    //       : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    options.headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let form = new FormData();
    form.append('Description', data.Description);
    data.Id != null ? form.append('Id', data.Id) : '';
    data.TargetValue != null
      ? form.append('TargetValue', data.TargetValue)
      : '';
    data.ActualValue != null
      ? form.append('ActualValue', data.ActualValue)
      : '';
    data.Unit != null ? form.append('Unit', data.Unit) : '';
    // data.StartDate != null ? form.append("StartDate", data.StartDate) : "";
    data.Condition != null ? form.append('Condition', data.Condition) : '';
    data.IsImportant != null
      ? form.append('IsImportant', data.IsImportant)
      : '';
    data.IsFollowed != null ? form.append('IsFollowed', data.IsFollowed) : '';
    data.TacticId != null ? form.append('TacticId', data.TacticId) : '';
    data.Owner_UserId != null
      ? form.append('Owner_UserId', data.Owner_UserId)
      : '';
    data.AssignedBy_UserId != null
      ? form.append('AssignedBy_UserId', data.AssignedBy_UserId)
      : '';
    form.append('DueDate', data.DueDate);
    data.ParentTeamId != null
      ? form.append('ParentTeamId', data.ParentTeamId)
      : '';
      data.ESP_RequestId != null
      ? form.append('ESP_RequestId', data.ESP_RequestId)
      : '';

      data.ESP_RequestNumber != null
      ? form.append('ESP_RequestNumber', data.ESP_RequestNumber)
      : '';
      data.ESP_RequestName != null
      ? form.append('ESP_RequestName', data.ESP_RequestName)
      : '';
      data.IsShared != null
      ? form.append('IsShared', data.IsShared)
      : '';
      // data.ShareWithIds != null
      // ? form.append("ShareWithIds", data.ShareWithIds)
      // : "";
      if (data.ShareWithIds != null && data.ShareWithIds.length > 0) {
        for (var i = 0; i < data.ShareWithIds.length; i++) {
          form.append('ShareWithIds[' + i + ']', data.ShareWithIds[i]);
        }
      }
      data.MaxClaims != null
      ? form.append('MaxClaims', data.MaxClaims)
      : '';
    data.Weight != null ? form.append('Weight', data.Weight) : '';
    data.IsPlanned != null ? form.append('IsPlanned', data.IsPlanned) : '';
    data.Note != null ? form.append('Note', data.Note) : '';
    if (data.Effort !== null) {
      data.Effort.StartTime != null
        ? form.append('Effort.StartTime', data.Effort.StartTime)
        : '';
      data.Effort.EndTime != null
        ? form.append('Effort.EndTime', data.Effort.EndTime)
        : '';
      data.Effort.Hours != null
        ? form.append('Effort.Hours', data.Effort.Hours)
        : '';
      data.Effort.Minutes != null
        ? form.append('Effort.Minutes', data.Effort.Minutes)
        : '';
      data.Effort.CommentText != null
        ? form.append('Effort.CommentText', data.Effort.CommentText)
        : '';
      data.Effort.CompletedDate != null
        ? form.append('Effort.CompletedDate', data.Effort.CompletedDate)
        : '';
    }

    data.Files != null ? form.append('Files', data.Files) : '';

    return this._http.post<any>(url, form, options);
  }

  searchForMySpace(data: any): Observable<any> {
    const url = `api/SearchApi/SearchForMySpace`;
    return this._http.post<any>(url, data, this._authService.ssOptions);
  }

  getAllByParent(data: any): Observable<any> {
    const url = `api/TacticApi/GetAllByParent`;
    return this._http.post<any>(url, data, this._authService.ssOptions);
  }

  searchUsers(data: any): Observable<any> {
    const url = `${environment.mainURL}api/SearchApi/SearchUsers`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    //return this._http.post<any>(url, data, this._authService.ssOptions);
    return this._http.post<any>(url, data, options);
  }

  searchUnit(data: any): Observable<any> {
    const url = `${environment.mainURL}api/SearchApi/SearchUnits`;
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    //return this._http.post<any>(url, data, this._authService.ssOptions);
    return this._http.post<any>(url, data, options);
  }

  async getAllConvertedFromCalendar():Promise<any> {
    const url = `api/IndicatorStemeXe/GetAllConvertedFromCalendar`;
    return this._http.get<any>(url, this._authService.ssOptions).toPromise();
  }
  async isEventConvertedToActivity(data:any):Promise<any> {
    const url = `api/IndicatorStemeXe/IsEventConvertedToActivity`;
    return this._http.post<any>(url,data, this._authService.ssOptions).toPromise();
  }


  getFiltersForActiveList(
    list: any,
    engProLoggedInUserId?: string
  ): Observable<any> {
    let _url: any = null;
    // const options = {
    //   headers: this._authService.buildAuthHeader(
    //     AuthType.SimpleStrata,

    //     !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
    //   ),
    // };
    const options = {
      headers: this._authService.buildAuthHeader(AuthType.AccessToken),
    };
    switch (list.type) {
      case StemeXeListType.Following:
        _url = `api/IndicatorStemeXe/GetFiltersForFollowing`;
        return this._http.get<any>(_url, options);
        break;
      case StemeXeListType.Backlog:
        _url = `${environment.mainURL}api/IndicatorStemeXe/GetFiltersForBacklog`;
        return this._http.get<any>(_url, options);
        break;
      case StemeXeListType.User:
        _url = `api/IndicatorStemeXe/GetFiltersForUser`;
        let data = {
          UserId: list.userId,
        };
        return this._http.post<any>(_url, data, options);
        break;
      default:
        _url = `${environment.mainURL}api/IndicatorStemeXe/GetFiltersForMine`;
        return this._http.get<any>(_url, options);
        break;
    }
  }

  createEngProActivity(
    data: any,
    engProLoggedInUserId: string
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/EngPro/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };
    options.headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let form = new FormData();
    form.append('Description', data.Description);
    data.TargetValue != null
      ? form.append('TargetValue', data.TargetValue)
      : '';
    data.ActualValue != null
      ? form.append('ActualValue', data.ActualValue)
      : '';
    data.Unit != null ? form.append('Unit', data.Unit) : '';
    data.IsImportant != null
      ? form.append('IsImportant', data.IsImportant)
      : '';
    data.IsFollowed != null ? form.append('IsFollowed', data.IsFollowed) : '';
    data.TacticId != null ? form.append('TacticId', data.TacticId) : '';
    data.Owner_UserId != null
      ? form.append('Owner_UserId', data.Owner_UserId)
      : '';

    data.AssignedBy_UserId != null
      ? form.append('AssignedBy_UserId', data.AssignedBy_UserId)
      : '';
    form.append('DueDate', data.DueDate);

    data.StartDate ? form.append('StartDate', data.StartDate) : '';
    data.ParentTeamId != null
      ? form.append('ParentTeamId', data.ParentTeamId)
      : '';
    data.Weight != null ? form.append('Weight', data.Weight) : '';
    data.Note != null ? form.append('Note', data.Note) : '';
    if (data.Effort !== null) {
      data.Effort.StartTime != null
        ? form.append('Effort.StartTime', data.Effort.StartTime)
        : '';
      data.Effort.EndTime != null
        ? form.append('Effort.EndTime', data.Effort.EndTime)
        : '';
      data.Effort.Hours != null
        ? form.append('Effort.Hours', data.Effort.Hours)
        : '';
      data.Effort.Minutes != null
        ? form.append('Effort.Minutes', data.Effort.Minutes)
        : '';
      data.Effort.CommentText != null
        ? form.append('Effort.CommentText', data.Effort.CommentText)
        : '';
      data.Effort.CompletedDate != null
        ? form.append('Effort.CompletedDate', data.Effort.CompletedDate)
        : '';
    }

    data.Files != null ? form.append('Files', data.Files) : '';

    return this._http.post<any>(url, form, options);
  }

  reassign(
    data: any,
    engProLoggedInUserId?: string,
    isEngProActivity?: boolean
  ): Observable<any> {
    const url = !isEngProActivity
      ? `api/IndicatorStemeXe/Reassign`
      : `api/IndicatorStemeXe/EngPro/Reassign`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,

        isEngProActivity && !!engProLoggedInUserId
          ? engProLoggedInUserId.toString()
          : undefined
      ),
    };

    options.headers.append('client-id', 'web');
    options.headers.append('locale', 'en');
    options.headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let form = new FormData();
    form.append('Description', data.Description);
    form.append('ReassignReason', data.ReassignReason);
    data.Id != null ? form.append('Id', data.Id) : '';
    data.TargetValue != null
      ? form.append('TargetValue', data.TargetValue)
      : '';
    data.ActualValue != null
      ? form.append('ActualValue', data.ActualValue)
      : '';
    data.Unit != null ? form.append('Unit', data.Unit) : '';
    data.IsImportant != null
      ? form.append('IsImportant', data.IsImportant)
      : '';
    data.IsFollowed != null ? form.append('IsFollowed', data.IsFollowed) : '';
    data.TacticId != null ? form.append('TacticId', data.TacticId) : '';
    data.Owner_UserId != null
      ? form.append('Owner_UserId', data.Owner_UserId)
      : '';
    data.AssignedBy_UserId != null
      ? form.append('AssignedBy_UserId', data.AssignedBy_UserId)
      : '';
    form.append('DueDate', data.DueDate);
    data.ParentTeamId != null
      ? form.append('ParentTeamId', data.ParentTeamId)
      : '';
    data.Weight != null ? form.append('Weight', data.Weight) : '';
    data.IsPlanned != null ? form.append('IsPlanned', data.IsPlanned) : '';
    data.Note != null ? form.append('Note', data.Note) : '';
    if (data.Effort !== null) {
      data.Effort.StartTime != null
        ? form.append('Effort.StartTime', data.Effort.StartTime)
        : '';
      data.Effort.EndTime != null
        ? form.append('Effort.EndTime', data.Effort.EndTime)
        : '';
      data.Effort.Hours != null
        ? form.append('Effort.Hours', data.Effort.Hours)
        : '';
      data.Effort.Minutes != null
        ? form.append('Effort.Minutes', data.Effort.Minutes)
        : '';
      data.Effort.CommentText != null
        ? form.append('Effort.CommentText', data.Effort.CommentText)
        : '';
      data.Effort.CompletedDate != null
        ? form.append('Effort.CompletedDate', data.Effort.CompletedDate)
        : '';
    }

    data.Files != null ? form.append('Files', data.Files) : '';

    return this._http.post<any>(url, form, options);
  }

getUserInfoForStemexe(oppProData: any): Observable<any> {
  let data:any = [];
  if(oppProData && oppProData.access_token) {
    const url = `${environment.oppProApiHost}/GetUserInfoForStemexe`;
    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.access_token}`,
      }),
    };

    return this._http.get<any>(url, options);
  }
  return data;
}

  getCallToActionsAssociatedWithCallToActionModules(
    type: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/GetCallToActionsAssociatedWithCallToActionModules?CallToActionModuleName=${type}`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };
    return this._http.post<any>(url, null, options);
  }

  getOpportunityListForActivities(
    applicationUserId: string,
    organizationId: string,
    keyword: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/getOpportunityListForActivities`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    let data = {
      applicationUserId: applicationUserId,
      organizationId: organizationId,
      pageNo: 0,
      pageSize: 5000,
      searchPhrase: keyword,
    };
    return this._http.post<any>(url, data, options);
  }

  getOpportunityOwners(oppProData: any): Observable<any> {
    const url = `${environment.oppProApiHost}/GetOwners`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.get<any>(url, options);
  }

  searchCustomerByFilter(
    filters: Array<number>,
    keyword: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/SearchCustomerByFilter`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    let data = {
      territoryFilter: filters,
      pageNo: 1,
      pageSize: 5000,
      searchPhrase: keyword,
    };
    return this._http.post<any>(url, data, options);
  }

  // getAllSalesJobListing(oppProData: any) {
  //   const url = `${environment.oppProApiHost}/GetAllSalesJobListing`;

  //   const options = {
  //     headers: new HttpHeaders({
  //       customheader: this._simpleStrataAuthService.oppProData.customHeader,
  //       Authorization: `Bearer ${oppProData.accessToken}`,
  //     }),
  //   };

  //   return this._http.get<any>(url, options);
  // }

  getOwnersWithDetails(oppProData: any) {
    const url = `${environment.oppProApiHost}/GetOwnersWithDetails`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.get<any>(url, options);
  }

  getAllFileTypeSettings(oppProData: any) {
    const url = `${environment.oppProApiHost}/GetAllFileTypeSettings`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, null, options);
  }

  getCustomerContactsList(
    customerId: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/GetCustomerContactsList?customerId=${customerId}`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };
    return this._http.get<any>(url, options);

    //SearchCustomerByFilter
  }

  getCustomerContactsListWithDetails(
    customerId: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/GetCustomerContactsListWithDetail?customerId=${customerId}`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };
    return this._http.get<any>(url, options);

    //SearchCustomerByFilter
  }
  //
  createOppProMeeting(data: any, oppProData: any) {
    //Add_Activity_SS

    const url = `${environment.oppProApiHost}/Add_MeetingActivity_SS`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }
  editOppProMeeting(data: any, oppProData: any) {
    //Add_Activity_SS

    const url = `${environment.oppProApiHost}/Edit_MeetingActivity_SS `;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }
  createOppProCall(data: any, oppProData: any) {
    //Add_Activity_SS

    const url = `${environment.oppProApiHost}/Add_Activity_SS`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  editOppProCall(data: any, oppProData: any) {
    const url = `${environment.oppProApiHost}/Edit_Activity_SS`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  createOppProProposal(data: any, oppProData: any) {
    //Add_Activity_SS

    const url = `${environment.oppProApiHost}/Add_ProposalActivity_SS`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  editOppProProposal(data: any, oppProData: any) {
    const url = `${environment.oppProApiHost}/Edit_ProposalActivity_SS`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  addCallToActionToActivity(data: any, oppProData: any) {
    const url = `${environment.oppProApiHost}/AddCallToActionToActivity`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  updateCallToActionInActivity(data: any, oppProData: any) {
    const url = `${environment.oppProApiHost}/UpdateCallToActionInActivity`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.post<any>(url, data, options);
  }

  getOppProActivityDetails(
    activityId: string,
    oppProData: any
  ): Observable<any> {
    const url = `${environment.oppProApiHost}/GetActivityById?Activityid=${activityId}`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.access_token}`,
      }),
    };
    return this._http.get<any>(url, options);
  }

  getUserList(oppProData: any) {
    const url = `${environment.oppProApiHost}/GetUserList`;

    const options = {
      headers: new HttpHeaders({
        customheader: this._simpleStrataAuthService.oppProData.customHeader,
        Authorization: `Bearer ${oppProData.accessToken}`,
      }),
    };

    return this._http.get<any>(url, options);
  }

  claim(id: string): Observable<any> {
    const url = `api/IndicatorStemeXe/Claim`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data={
      Id:id
    }

    return this._http.post<any>(url, data,options);
  }

  stopClaiming(id: string): Observable<any> {
    const url = `api/IndicatorStemeXe/StopClaiming`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data={
      Id:id
    }

    return this._http.post<any>(url, data,options);
  }

  completeClaimed(id: string): Observable<any> {
    const url = `api/IndicatorStemeXe/CompleteClaimed`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data={
      Id:id
    }

    return this._http.post<any>(url, data,options);
  }

  cancelClaimed(id: string): Observable<any> {
    const url = `api/IndicatorStemeXe/CancelClaimed`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    let data={
      Id:id
    }

    return this._http.post<any>(url, data,options);
  }

  updateEPMSettings(data:any): Observable<any> {
    const url = `api/UserApi/UpdateEPMSettings`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    return this._http.post<any>(url, data,options);
  }

  removeEPMSettings(){
    const url = `api/UserApi/RemoveEPMSettings`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata
      ),
    };
    return this._http.get<any>(url, options);
  }

  searchProjects(data: any): Observable<any> {
    const url = `api/IndicatorStemeXe/EPM/SearchProjects`;
    return this._http.post<any>(url, data, this._authService.ssOptions);
  }


  createEPMActivity(
    data: any
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/EPM/Create`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
      ),
    };
    return this._http.post<any>(url, data, options);
  }

  updateEPMActivity(
    data: any
  ): Observable<any> {
    const url = `api/IndicatorStemeXe/EPM/Update`;
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
      ),
    };
    return this._http.post<any>(url, data, options);
  }

  getAllInWeekForMineForPaging(engProLoggedInUserId?: string, keyword?: string, pageIndex?: number, pageSize?: number): Observable<any> {
    const url = `api/IndicatorStemeXe/GetAllByWeeksForMineWithPaging`;
    let data: {
      Keyword: string | undefined;
      PageIndex: number | undefined;
      PageSize: number | undefined;
    } = {
      Keyword: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    const options = {
      headers: this._authService.buildAuthHeader(
        AuthType.SimpleStrata,
        !!engProLoggedInUserId ? engProLoggedInUserId.toString() : undefined
      ),
    };

    return this._http.post<any>(url, data, options);
  }
}
