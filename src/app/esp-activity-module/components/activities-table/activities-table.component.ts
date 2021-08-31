import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
// import { Activity } from "../models/activity";
import { delay, takeUntil, tap } from 'rxjs/operators';
// import { ActivitiesService } from "../services/activities.service";
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, Subscription } from 'rxjs';
import { AlertService } from '../../alert/alert.service';
import { StemeXeListType } from '../../enums/enums';
import { SCREEN_SIZE } from '../../enums/shared.enums';
import { Activity } from '../../models/activity';
import { ActivitiesService } from '../../services/activities.service';
import { ResizeService } from '../../services/resize.service';
// import { Activity } from 'app/esp-activity-module/models/activity';
// import { ResizeService } from 'app/esp-activity-module/services/resize.service';
// import { ActivitiesService } from 'app/esp-activity-module/services/activities.service';
// import { AlertService } from 'app/esp-activity-module/alert/alert.service';
// import { SCREEN_SIZE } from 'app/esp-activity-module/enums/shared.enums';
// import { StemeXeListType } from 'app/esp-activity-module/enums/enums';
// import { StemeXeListType } from '../enums';
// import { ResizeService } from "../../shared/services/resize.service";
// import { AlertService } from "../../shared/alert/alert.service";
// import { SCREEN_SIZE } from "../../shared/shared.enums";

@Component({
  selector: 'xcdrs-activities-table',
  templateUrl: './activities-table.component.html',
  styleUrls: ['./activities-table.component.scss'],
})
export class ActivitiesTableComponent implements OnInit {
  @Input() groupList!: Array<any>;
  @Input() loggedInUserId: any;
  @Input() activeTab: any;
  @Input() engProLoggedInUserId: any;
  @Input() isEngProActivity: any;
  @Input() totalCount!: number;
  @Input() lastLoadedCount!: number;
  @Input() isEngProEnabled!: boolean;
  @Input() isESPcomponent = false;
  @Input() requestModuleName = '';
  @Input() requestName = '';
  @Input() isMyspace!: boolean;
  @Input() oppProData: any;
  @Input() espAddon: any;
  @Input() pageNo = 0;
  @Output() reloadList: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: any;
  size: any;
  isAllAssignedByLoggedIn = false;
  isElementBtnClicked = false;
  isFirstRow = false;

  pageSize = 6;
  private activitiesSubscription!: Subscription;
  dataLoaded = false;
  isloading = false;
  @Input() activities!: Observable<Activity[]>;
  StemeXeListType = {
    Mine: 0,
    Following: 1,
    Backlog: 2,
    User: 3,
    Shared: 4,
  };
  displayedColumns: string[] = [];
  displayedColumnsHeaders: string[] = [];
  constructor(
    private _router: Router,
    private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    public _dialog: MatDialog,
    public cdRef: ChangeDetectorRef
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    // this.pageNo = 0;
    // this.pageSize = this.totalCountActivity;
    this.loadGroupActivities();
  }

  loadGroupActivities() {
    this.activitiesSubscription = this.activities.subscribe((resp) => {
      if (!!resp) {
        this.isAllAssignedByLoggedIn = resp.every((ele) => {
          return !!ele.createdBy && ele.createdBy.UserId == this.loggedInUserId;
        });
        this.dataSource = resp.slice(-resp.length);
        this.cdRef.detectChanges();
        if (this.dataSource && this.dataSource.length) {
          this.dataSource.map((obj: any) => {
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
              'description',
              'dueDate',
              'claimed',
              'started',
              'completed',
              // 'flag',
              'actions',
            ];
            this.displayedColumns = [
              'description',
              'dueDate',
              'claimed',
              'started',
              'completed',
              // 'flag',
              'actions',
              'hover',
            ];
            break;
          case StemeXeListType.Backlog:
            this.displayedColumnsHeaders = ['description', 'actions'];
            this.displayedColumns = ['description', 'actions', 'hover'];
            break;
          case StemeXeListType.Mine:
            if (this.isESPcomponent) {
              this.displayedColumnsHeaders = [
                'description',
                'dueDate',
                'status',
                'assignedTo',
                'efforts',
                'actions',
              ];
              this.displayedColumns = [
                'description',
                'dueDate',
                'status',
                'assignedTo',
                'efforts',
                'actions',
                'hover',
              ];
            } else {
              if (this.isAllAssignedByLoggedIn) {
                this.displayedColumnsHeaders = [
                  'description',
                  'dueDate',
                  'effortSum',
                  'status',
                  'progress',
                  'progressBar',
                  'linkedTo',
                  // 'flag',

                  'actions',
                ];
                this.displayedColumns = [
                  'description',
                  'dueDate',
                  'effortSum',
                  'status',
                  'progress',
                  'progressBar',
                  'linkedTo',
                  // 'flag',
                  'actions',
                  'hover',
                ];
              } else {
                this.displayedColumnsHeaders = [
                  'description',
                  'dueDate',
                  'effortSum',
                  'status',
                  'progress',
                  'progressBar',
                  'linkedTo',
                  'assignedBy',
                  // 'flag'
                  'actions',
                ];
                this.displayedColumns = [
                  'description',
                  'dueDate',
                  'effortSum',
                  'status',
                  'progress',
                  'progressBar',
                  'linkedTo',
                  'assignedBy',
                  // 'flag',
                  'actions',
                  'hover',
                ];
              }
            }

            break;
          case StemeXeListType.User:
            this.displayedColumnsHeaders = [
              'description',
              'dueDate',
              'status',
              'progress',
              'progressBar',
              'review',
              'actions',
            ];
            this.displayedColumns = [
              'description',
              'dueDate',
              'status',
              'progress',
              'progressBar',
              'review',
              'actions',
              'hover',
            ];
            break;
          case StemeXeListType.Following:
            this.displayedColumnsHeaders = [
              'description',
              'dueDate',
              'status',
              'progress',
              'progressBar',
              'review',
              'assignedTo',
              'actions',
            ];
            this.displayedColumns = [
              'description',
              'dueDate',
              'status',
              'progress',
              'progressBar',
              'review',
              'assignedTo',
              'actions',
              'hover',
            ];
            break;
        }
        this.dataLoaded = true;
      }
    });
  }

  openActivityDetails(row: Activity) {
    console.log('row', row);
    const queryParams: {
      accessedFrom: any;
      preTab: any;
      innerPreTab: any;
      isESPcomponent: any;
      moduleName?: any;
      requestName?: any;
      my?: any;
    } = {
      accessedFrom:
        this.activeTab === StemeXeListType.Shared
          ? 'shared'
          : this.activeTab === StemeXeListType.User
          ? 'user'
          : 'list',
      preTab:
        this.activeTab === StemeXeListType.Mine
          ? StemeXeListType.Mine
          : this.activeTab === StemeXeListType.Backlog
          ? StemeXeListType.Backlog
          : StemeXeListType.Following,
      innerPreTab: this.activeTab === StemeXeListType.Following ? 1 : null,
      isESPcomponent: this.isESPcomponent,
    };
    if (this.isESPcomponent) {
      queryParams.moduleName = this.requestModuleName;
      queryParams.requestName = this.requestName;
      queryParams.my = this.isMyspace;
    }

    if (row.isShared) {
      localStorage.setItem(
        'preURL',
        'activities/following/shared/details'
      );
    }
    if (row.appType === 3) {
      this._router.navigate(
        [
          `activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`,
        ],
        { queryParams }
      );
    } else if (row.appType === 2) {
      this._router.navigate([`activities/details/oppProAct/${row.id}`], {
        queryParams,
      });
    } else if (row.appType === 1) {
      this._router.navigate([`activities/details/engProAct/${row.id}`], {
        queryParams,
      });
    } else {
      this._router.navigate([`/project/${row.requestId}/activities/details/${row.id}`], {
        queryParams,
      });
    }
  }

  changePreStyle(rowId: any, dataSource: any): void {
    if (dataSource != null) {
      const rows = dataSource;
      for (let i = 0; i < rows.length; i++) {
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

  resetPreStyle(dataSource: any) {
    this.isFirstRow = false;
    dataSource.forEach((row: any) => {
      row.isHover = false;
      row.isRowBefore = false;
    });
  }

  pageEvents(event: any) {
    this.pageChange.emit(event);
  }

  doFollow(activity: any) {
    if (!activity.isFollowed) {
      this._activitiesService
        .follow(activity.id, this.engProLoggedInUserId, this.isEngProActivity)
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              activity.isFollowed = !activity.isFollowed;
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(resp.ResponseMessage, {
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
              this._alertService.success(resp.ResponseMessage, {
                timeout: 3000,
              });
            } else {
              this._alertService.error(resp.ResponseMessage, {
                timeout: 3000,
              });
            }
          }
        });
    }
  }

  toggleImportant(activity: any) {
    this._activitiesService
      .toggleImportant(
        activity.id,
        this.engProLoggedInUserId,
        activity.appType == 1
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            activity.isImportant = !activity.isImportant;
            this._alertService.success(resp.ResponseMessage, {
              timeout: 3000,
            });
          } else {
            this._alertService.error(resp.ResponseMessage, {
              timeout: 3000,
            });
          }
        }
      });
  }

  ngOnDestroy() {
    this.activitiesSubscription.unsubscribe();
  }

  onReload() {
    this.reloadList.emit(true);
  }
}
