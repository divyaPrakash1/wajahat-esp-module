import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Activity } from "../models/activity";
import { ActivityResizeService } from "../../shared/services/resize-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../shared/shared-activity.enums";
import { ActivitiesService } from "../services/activities.service";
import { ActivityAlertService } from "../../shared/alert/alert-activity.service";
import * as moment from "moment";
import { MatDialog } from "@angular/material/dialog";
import { Observable, Subscription } from "rxjs";
import { CentralizedActivity, StemeXeListType } from "../enums";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "xcdrs-activities-table",
  templateUrl: "./activities-table.component.html",
  styleUrls: ["./activities-table.component.scss"],
})
export class ActivitiesTableComponent implements OnInit {
  @Input() groupList: Array<any>;
  @Input() loggedInUserId: any;
  @Input() activeTab: any;
  @Input() engProLoggedInUserId: any;
  @Input() isEngProActivity: any;
  @Input() totalCount: number;
  @Input() lastLoadedCount: number;
  @Input() isEngProEnabled: boolean;
  @Input() isESPcomponent: boolean = false;
  @Input() requestModuleName: string = '';
  @Input() requestName: string = '';
  @Input() isMyspace: boolean;
  @Input() oppProData: any;
  @Input() espAddon: any;
  @Input() pageNo: number = 0;
  @Input() isSignature: boolean = false;
  
  @Output() reloadList: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectedActivity: EventEmitter<any> = new EventEmitter<boolean>();
  @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  size: any;
  isAllAssignedByLoggedIn: boolean = false;
  isElementBtnClicked: boolean = false;
  isFirstRow: boolean = false;

  pageSize: number = 6;
  private activitiesSubscription: Subscription;
  dataLoaded: boolean = false;
  isloading: boolean = false;
  @Input() activities: Observable<Activity[]>;
  StemeXeListType = {
    Mine: 0,
    Following: 1,
    Backlog: 2,
    User: 3,
    Shared: 4,
    Closed: 5,
    Signed: 6,
    Rejected: 7,
  };
  displayedColumns: string[] = [];
  displayedColumnsHeaders: string[] = [];

  isFromSignature: boolean = false;

  selection = new SelectionModel(true, []);
  isArabic: boolean = false;
  SourceSystemId: any = null;
  SourceTenantId:any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  constructor(
    private _router: Router,
    private _resizeService: ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    public _dialog: MatDialog,
    public cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });

    this.route.queryParams.subscribe(params => {
      if (params["SourceSystemId"]) {
        this.SourceSystemId = +params["SourceSystemId"];
      } else {
        this.SourceSystemId = null;
      }
      if (params["SourceTenantId"]) {
        this.SourceTenantId = +params["SourceTenantId"];
      } else {
        this.SourceTenantId = null;
      }
      if (params["SourceObjectTypeId"]) {
        this.SourceObjectTypeId = +params["SourceObjectTypeId"];
      } else {
        this.SourceObjectTypeId = null;
      }
      if (params["SourceObjectId"]) {
        this.SourceObjectId = +params["SourceObjectId"];
      } else {
        this.SourceObjectId = null;
      }
      if (params["fromTab"]) {
        this.fromTab = params["fromTab"];
      } else {
        this.fromTab = null;
      }
      if (params["teamId"]) {
        this.teamId = +params["teamId"];
      } else {
        this.teamId = null;
      }
      if (params["selectedTab"]) {
        this.scoreCardSelectedTab = +params["selectedTab"];
      } else {
        this.scoreCardSelectedTab = null;
      }
    })
  }

  ngOnInit(): void {
    this.isESPcomponent = (this.SourceSystemId || this.teamId) ? true : false;
    this.getLanguage();
    // this.pageNo = 0;
    //this.pageSize = this.totalCountActivity;
    //this.isFromSignature = (this.activeTab)
    this.loadGroupActivities();
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  loadGroupActivities() {
    this.activitiesSubscription = this.activities.subscribe((resp) => {
      if (!!resp) {
        this.isAllAssignedByLoggedIn = resp.every((ele) => {
          return !!ele.createdBy && ele.createdBy.UserId == this.loggedInUserId;
        });
        this.dataSource = resp.slice(-resp.length);
        console.log("dataSource", this.dataSource);
        this.cdRef.detectChanges();
        if (this.dataSource && this.dataSource.length) {
          this.dataSource.map((obj) => {
            if (obj && (obj.effortSum != 0 || obj.effortSum != null)) {
              let data = obj.effortSum / 60;
              data = parseInt(data.toString());
              obj.effortInHour = data;
              obj.effortInMinute = obj.effortSum % 60;
            }
          });
        }
        this.pageSize =
          this.pageSize == this.dataSource.length ||
          this.pageSize < this.dataSource.length
            ? this.dataSource.length
            : this.pageSize;
        switch (this.activeTab) {
          
          case StemeXeListType.Shared:
            this.displayedColumnsHeaders = [
              "description",
              "dueDate",
              "claimed",
              "started",
              "completed",
              //'flag',
              "actions",
            ];
            this.displayedColumns = [
              "description",
              "dueDate",
              "claimed",
              "started",
              "completed",
              // 'flag',
              "actions",
              "hover",
            ];
            break;
          case StemeXeListType.Backlog:
            this.displayedColumnsHeaders = ["description", "actions"];
            this.displayedColumns = ["description", "actions", "hover"];
            break;
          case StemeXeListType.Mine:
            if (this.isESPcomponent) {
              this.displayedColumnsHeaders = [
                // "description",
                // "dueDate",
                // "status",
                // "assignedTo",
                // "efforts",
                // "actions",
                "description",
                "assignedTo",
                "dueDate",
                "status",
                "progress",
                "efforts",
                "actions",
              ];
              this.displayedColumns = [
                // "description",
                // "dueDate",
                // "status",
                // "assignedTo",
                // "efforts",
                // "actions",
                // "hover",
                "description",
                "assignedTo",
                "dueDate",
                "status",
                "progress",
                "efforts",
                "actions",
                "hover",
              ];
            } else {
              if (this.isAllAssignedByLoggedIn) {
                this.displayedColumnsHeaders = [
                  "description",
                  "dueDate",
                  "effortSum",
                  "status",
                  "progress",
                  "progressBar",
                  "linkedTo",
                  // 'flag',

                  "actions",
                ];
                this.displayedColumns = [
                  "description",
                  "dueDate",
                  "effortSum",
                  "status",
                  "progress",
                  "progressBar",
                  "linkedTo",
                  // 'flag',
                  "actions",
                  "hover",
                ];
              } else {
                this.displayedColumnsHeaders = [
                  "description",
                  "dueDate",
                  "effortSum",
                  "status",
                  "progress",
                  "progressBar",
                  "linkedTo",
                  "assignedBy",
                  // 'flag'
                  "actions",
                ];
                this.displayedColumns = [
                  "description",
                  "dueDate",
                  "effortSum",
                  "status",
                  "progress",
                  "progressBar",
                  "linkedTo",
                  "assignedBy",
                  // 'flag',
                  "actions",
                  "hover",
                ];
              }
            }

            break;
          case StemeXeListType.User:
            this.displayedColumnsHeaders = [
              "description",
              "dueDate",
              "status",
              "progress",
              "progressBar",
              "review",
              "actions",
            ];
            this.displayedColumns = [
              "description",
              "dueDate",
              "status",
              "progress",
              "progressBar",
              "review",
              "actions",
              "hover",
            ];
            break;
          case StemeXeListType.Following:
            this.displayedColumnsHeaders = [
              "description",
              "dueDate",
              "status",
              "progress",
              "progressBar",
              "review",
              "assignedTo",
              "actions",
            ];
            this.displayedColumns = [
              "description",
              "dueDate",
              "status",
              "progress",
              "progressBar",
              "review",
              "assignedTo",
              "actions",
              "hover",
            ];
            break;

          ////   start

          case StemeXeListType.Closed:
            this.displayedColumnsHeaders = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "signed",
              "actions",
            ];
            this.displayedColumns = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "signed",
              "actions",
            ];
            break;

          case StemeXeListType.Signed:
            this.displayedColumnsHeaders = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "actions",
            ];
            this.displayedColumns = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "actions",
            ];
            break;

          case StemeXeListType.Rejected:
            this.displayedColumnsHeaders = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "signed",
              "actions",
            ];
            this.displayedColumns = [
              "select",
              "description",
              "dueDate",
              "owner",
              "effortSum",
              "status",
              "signed",
              "actions",
            ];
            break;

          //// Ends
        }
        if (this.displayedColumnsHeaders.includes("progressBar")) {
          let data = null;
          data = this.dataSource.filter(
            (element: any) => element.score != null && element.status != 4
          );
          if (data.length == 0) {
            this.displayedColumnsHeaders = this.displayedColumnsHeaders.filter(
              (element: any) =>
                element != "progressBar" && element != "progress"
            );
            this.displayedColumns = this.displayedColumns.filter(
              (element: any) =>
                element != "progressBar" && element != "progress"
            );
          }
        }
        this.dataLoaded = true;
      }
    });
  }

  openActivityDetails(row: Activity) {
    console.log("rerwerwerwerwrwerwe");
    if(!this.isSignature) { 
      let queryParams: {
        accessedFrom: any;
        preTab: any;
        innerPreTab: any;
        isESPcomponent: any;
        moduleName?: any;
        requestName?: any;
        my?: any;
        fromTab?: any;
        teamId?: any;
        selectedTab?: any;
        SourceSystemId?:any;
        SourceTenantId?:any;
        SourceObjectTypeId?:any;
        SourceObjectId?:any;
      } = {
        accessedFrom:
          this.activeTab == StemeXeListType.Shared
            ? "shared"
            : this.activeTab == StemeXeListType.User
            ? "user"
            : "list",
        preTab:
          this.activeTab == StemeXeListType.Mine
            ? StemeXeListType.Mine
            : this.activeTab == StemeXeListType.Backlog
            ? StemeXeListType.Backlog
            : StemeXeListType.Following,
        innerPreTab: this.activeTab == StemeXeListType.Following ? 1 : null,
        isESPcomponent: this.isESPcomponent
      };
      if (this.isESPcomponent) {
        queryParams.moduleName = this.requestModuleName;
        queryParams.requestName = this.requestName;
        queryParams.my = true;
      }

      if (this.teamId != 0) {
        queryParams.fromTab = this.fromTab;
        queryParams.teamId = this.teamId;
        queryParams.selectedTab = this.scoreCardSelectedTab;
      }

      queryParams.SourceSystemId = this.SourceSystemId;
      queryParams.SourceTenantId = this.SourceTenantId;
      queryParams.SourceObjectTypeId = this.SourceObjectTypeId;
      queryParams.SourceObjectId = this.SourceObjectId

      if (row.isShared) {
        localStorage.setItem(
          "preURL",
          "/pages/activities/following/shared/details"
        );
      }
      if (row.appType == 3) {
        this._router.navigate(
          [
            `pages/activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`,
          ],
          { queryParams }
        );
      } else if (row.appType == 2) {
        this._router.navigate([`pages/activities/details/oppProAct/${row.id}`], {
          queryParams,
        });
      } else if (row.appType == 1) {
        this._router.navigate([`pages/activities/details/engProAct/${row.id}`], {
          queryParams,
        });
      } else {
        this._router.navigate([`pages/activities/details/${row.id}`], {
          queryParams,
        });
      }
    }
  }

  changePreStyle(rowId, dataSource) {
    if (dataSource != null) {
      let rows = dataSource;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id == rowId) {
          rows[i].isHover = true;
          if (i != 0) {
            rows[i - 1].isRowBefore = true;
          } else {
            this.isFirstRow = true;
          }
        }
      }
    }
  }

  resetPreStyle(dataSource) {
    this.isFirstRow = false;
    dataSource.forEach((row) => {
      row.isHover = false;
      row.isRowBefore = false;
    });
  }

  pageEvents(event: any) {
    this.pageChange.emit(event);
  }

  doFollow(activity) {
    if (!activity.isFollowed) {
      this._activitiesService
        .follow(activity.id, this.engProLoggedInUserId, this.isEngProActivity)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isFollowed = !activity.isFollowed;
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    } else {
      this._activitiesService
        .unfollow(activity.id, this.engProLoggedInUserId, this.isEngProActivity)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isFollowed = !activity.isFollowed;
              this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  toggleImportant(activity) {
    this._activitiesService
      .toggleImportant(
        activity.id,
        this.engProLoggedInUserId,
        activity.appType == 1
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            console.log("ToggleImportant");
            activity.isImportant = !activity.isImportant;
            this._alertService.success(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }

  masterToggle(event) {
    // this.isAllSelected() ?
    //   this.selection.clear() :
    if (event.checked) {
      this.dataSource.forEach((row) => this.selection.select(row));
    } else {
      this.selection.clear();
    }
    this.selectedActivity.emit(this.selection.selected);
  }

  isAllSelected() {
    this.selectedActivity.emit(this.selection.selected);
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  ngOnDestroy() {
    this.activitiesSubscription.unsubscribe();
  }

  onReload() {
    this.reloadList.emit(true);
  }

  handleProgress(activity):{currentTarget,colorCode,scoreColorCode} {
    let colorCode;
    let scoreColorCode = activity.progressStatusColor;
    let now = moment(new Date());
    let dueDate = moment(new Date(activity.dueDate));
    let startDate = moment(new Date(activity.startDate));
    let dueDuration = moment.duration(dueDate.diff(startDate));
    let startDuration = moment.duration(now.diff(startDate));
    const currentTarget = new Date() < new Date(activity.dueDate)
    ? (activity.targetValue / Math.floor(dueDuration.asDays())) *
    Math.floor(startDuration.asDays())
    : activity.targetValue;
    if(activity.startDate && activity.startDate != 'Invalid date') {
      if (activity.score < currentTarget) {
        colorCode = "red";
        scoreColorCode = "#e21b24";
      } else {
        colorCode = "green";
        scoreColorCode = "#33ba70";
      }
      return {currentTarget,colorCode,scoreColorCode}
    } else {
      scoreColorCode = ((activity.appType == 0 || activity.appType == 3) && activity.progressStatusColor == "#00a3ff" && (activity.status == 1 || activity.status == 0)) ? scoreColorCode : "#aaadb8";
      return {currentTarget,colorCode,scoreColorCode}
    }
  }
}
