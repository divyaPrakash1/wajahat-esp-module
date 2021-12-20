import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivitiesService } from "../../services/activities.service";
// import { SimplestrataAuthService } from "../../../shared/services/simplestrata-auth-activity.service";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { Activity } from "../../models/activity";
import * as moment from "moment";
import { ActivityUtilsService } from "../../../shared/utils-activity.service";
import { MatTableDataSource } from "@angular/material/table";
import { Router, ActivatedRoute } from "@angular/router";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { ActivityDialog } from "../../dialogs/activity-dialog/activity-dialog";
import { MatDialog } from "@angular/material/dialog";
import { SimplestrataAuthService } from "src/app/activities/shared/services/simplestrata-auth.service";
// import { SimplestrataAuthService } from "src/app/shared/services/simplestrata-auth.service";

@Component({
  selector: "xcdrs-carousel-details",
  templateUrl: "./carousel-details.component.html",
  styleUrls: ["./carousel-details.component.scss"],
})
export class CarouselDetailsComponent implements OnInit {
  isLoading: boolean = false;
  isError: boolean = false;
  dataLoaded: boolean = false;
  size: string;
  activityArr: Array<any>;
  dataSource: any;
  loggedInUserId: any;
  displayedColumns: Array<string> = [];
  newList: Activity[] = [];
  search: string = '';
  listType: string;
  pageIndex: number = 0;
  pageSize: number = 10;
  tempArr: Array<any> = [];
  rejectionReason: string = '';
  isAllAssignedByLoggedIn: boolean = false;
  isFirstRow: boolean = false;
  isFirstRowInGroup: Array<boolean> = [];
  isElementBtnClicked: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageNo: number = 0;
  allLoaded: boolean = false;
  isEngProEnabled: boolean = false;
  isEngProDataLoaded: boolean = false;
  engProLoggedInUserId: any = null;
  isEngProActivity: boolean = false;
  isArabic: boolean = false;
  fromTab: any = null;
  teamId: any = null;
  scoreCardSelectedTab: any = null;
  SourceSystemId: any = null;
  SourceTenantId: any = null;
  SourceObjectTypeId: any = null;
  SourceObjectId: any = null;
  constructor(
    private _activitiesService: ActivitiesService,
    private _simplestrataAuthService: SimplestrataAuthService,
    private _resizeService: ActivityResizeService,
    private _alertService: ActivityAlertService,
    private _utils: ActivityUtilsService,
    private _router: Router,
    public _dialog: MatDialog,
    private _actRoute: ActivatedRoute
  ) {
    this.loggedInUserId = this._simplestrataAuthService.loggedInUserId;

    this.listType = this._actRoute.snapshot.params.type;
    console.log("Asdfasdfasdfasdf")
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
    this.isEngProActivity = !!this._actRoute.snapshot.params.activityType
      ? true
      : false;

      this._actRoute.queryParams.subscribe(params => {
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
      });
  }

  ngOnInit(): void {
    this._actRoute.data.subscribe((data) => {
      if (!!data) {
        if (!!data.engProData) {
          // data.engProData.subscribe((data) => {
          if (data.engProData.code == "001" && !!data.engProData.result) {
            this.engProLoggedInUserId = data.engProData.result.userId;
            this.isEngProEnabled = true;
          }

          this.loadAllNew();
          this.isEngProDataLoaded = true;
          //});
        }
        this.loadAllNew();
        this.isEngProDataLoaded = true;
      } else {
        this.loadAllNew();
        this.isEngProDataLoaded = true;
      }
    });
  }

  getLanguage() {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  getAllNewAssigned() {
    this.isLoading = true;
    this.pageIndex++;
    this._activitiesService
      .getAllNewAssigned(
        this.search,
        this.pageIndex,
        100000,
        this.engProLoggedInUserId
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.newList = resp.ResponseResult.map((newAssignedRec) => {
                return {
                  id: newAssignedRec.Id,
                  appType: newAssignedRec.AppType,
                  tacticTitle: newAssignedRec.TacticTitle,
                  description: newAssignedRec.Description,
                  targetValue: newAssignedRec.TargetValue,
                  actualValue: newAssignedRec.ActualValue,
                  createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                  score: newAssignedRec.Score,
                  requestNumber: newAssignedRec.ESP_RequestNumber,
                  requestName: newAssignedRec.ESP_RequestName,
                  dueDateLabel: this._utils.getDueDateLabel(
                    newAssignedRec.DueDate
                  ),
                  dueDate:
                    this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                    "Overdue"
                      ? this._utils.getDueDateTimeAgo(newAssignedRec.DueDate)
                      : this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                        "Due Today"
                      ? "Today"
                      : moment(newAssignedRec.DueDate).format("DD MMM YYYY"),
                  isOverdue:
                    this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                      "Overdue" ||
                    this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                      "Due Today"
                      ? true
                      : false,
                  effortInHour: newAssignedRec.EffortInHour,
                  effortInMinute: newAssignedRec.EffortInMinute,
                  unit: newAssignedRec.Unit,
                  parentBoardId: newAssignedRec.ParentBoardId,
                  parentBoardName: newAssignedRec.ParentBoardName,
                  status: newAssignedRec.Status,
                  createdBy: newAssignedRec.CreatedBy,
                  followed: newAssignedRec.IsFollowed,
                  important: newAssignedRec.IsImportant,
                  isShared:newAssignedRec.IsShared
                };
              });

              if (this.size && this.size.toLowerCase() != "xs") {
                this.dataSource = new MatTableDataSource(this.newList);
                setTimeout(() => {
                  this.dataSource.paginator = this.paginator;
                }, 1000);
              }

              this.isAllAssignedByLoggedIn = this.newList.every((ele) => {
                return ele.createdBy.UserId == this.loggedInUserId;
              });
              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.isError = true;
          this.dataLoaded = false;
          this.isLoading = false;
        }
      );
  }
  getAllNewReported() {
    this.isLoading = true;
    this.pageIndex++;
    this._activitiesService
      .getAllNewReported(
        this.search,
        this.pageIndex,
        100000,
        this.engProLoggedInUserId
      )
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              this.newList = resp.ResponseResult.map((newAssignedRec) => {
                return {
                  id: newAssignedRec.Id,
                  appType: newAssignedRec.AppType,
                  tacticTitle: newAssignedRec.TacticTitle,
                  description: newAssignedRec.Description,
                  targetValue: newAssignedRec.TargetValue,
                  actualValue: newAssignedRec.ActualValue,
                  createdBy_UserId: newAssignedRec.CreatedBy_UserId,
                  score: newAssignedRec.Score,
                  dueDate: moment(newAssignedRec.DueDate).format("DD MMM YYYY"),
                  isOverdue:
                    this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                      "Overdue" ||
                    this._utils.getDueDateLabel(newAssignedRec.DueDate) ==
                      "Due Today"
                      ? true
                      : false,
                  effortInHour: newAssignedRec.EffortInHour,
                  effortInMinute: newAssignedRec.EffortInMinute,
                  unit: newAssignedRec.Unit,
                  parentBoardId: newAssignedRec.ParentBoardId,
                  parentBoardName: newAssignedRec.ParentBoardName,
                  status: newAssignedRec.Status,
                  createdBy: newAssignedRec.CreatedBy,
                  owner: newAssignedRec.UserOwner,
                  followed: newAssignedRec.IsFollowed,
                  important: newAssignedRec.IsImportant,
                  isShared:newAssignedRec.IsShared
                };
              });

              if (this.size.toLowerCase() != "xs") {
                this.dataSource = new MatTableDataSource(this.newList);
                setTimeout(() => {
                  this.dataSource.paginator = this.paginator;
                }, 1000);
              }

              this.isAllAssignedByLoggedIn = this.newList.every((ele) => {
                return ele.createdBy.UserId == this.loggedInUserId;
              });

              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.isError = true;
          this.dataLoaded = false;
          this.isLoading = false;
        }
      );
  }
  pageEvents(event: any) {
    if (event.pageIndex > this.pageNo) {
      this.pageIndex++;
    } else {
      this.pageIndex--;
    }
  }
  loadAllNew() {
    if (this.listType == "assigned") {
      this.getAllNewAssigned();
    } else {
      this.getAllNewReported();
    }
  }

  onSearch(searchText: string) {
    this.search = searchText.trim().toLowerCase();
    if (this.size.toLowerCase() != "xs") {
      this.dataSource.filter = this.search;
    } else {
      if (this.isSearchMode()) {
        this.tempArr = this.newList;
        this.newList = this.newList.filter((card) => {
          return Object.keys(card).some(
            (key) =>
              key !== "id" &&
              card[key] != null &&
              card[key].toString().toLowerCase().includes(this.search)
          );
        });
      } else {
        this.newList = this.tempArr;
      }
    }
  }

  isSearchMode(): boolean {
    return this.search !== "" && this.search !== null;
  }

  openAddNewDialog(formMode: string): void {
    const dialogRef = this._dialog.open(ActivityDialog, {
      width: this.size == "XS" || this.size == "SM" ? "100%" : "744px",
      // //height: this.size == "XS" || this.size == "SM" ? "100%" : "520px",
      maxWidth: this.size == "XS" || this.size == "SM" ? "100vw" : "80vw",
      maxHeight: this.size == "XS" || this.size == "SM" ? "100vh" : "80vh",
      data: { isMine: true, formMode: formMode },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  acceptAssigned(item) {
    this._activitiesService
      .acceptAssigned(item.id, this.engProLoggedInUserId, this.isEngProActivity)
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            if (this.size.toLowerCase() != "xs") {
              this.dataSource.data.splice(
                this.dataSource.data.indexOf(item),
                1
              );
              this.dataSource = new MatTableDataSource(this.newList);
              setTimeout(() => {
                this.dataSource.paginator = this.paginator;
              }, 200);
              if (this.dataSource.data.length == 0) {
                this._router.navigate([`pages/activities`], { queryParams: { 
                  fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                  SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
              }
            } else {
              this.newList.splice(this.newList.indexOf(item), 1);
              if (this.newList.length == 0) {
                this._router.navigate([`pages/activities`], { queryParams: { 
                  fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                  SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
              }
            }
            this._alertService.success(
              !this.isArabic ? 
              "You accepted the “" +
                item.description +
                "” activity.Now you can find it under the “Mine” tab."
                : `لقد قبلت نشاط ${item.description}. يمكنك الآن العثور عليه ضمن النشاطات الخاصة بك.`,

              {
                timeout: 3000,
              }
            );
            //this.isElementBtnClicked = false;
          } else {
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
            //this.isElementBtnClicked = false;
          }
        }
      });
  }

  approveReported(item) {
    this._activitiesService
      .approveReported(
        item.id,
        this.engProLoggedInUserId,
        this.isEngProActivity
      )
      .subscribe((resp) => {
        if (!!resp) {
          if (resp.ResponseCode === 2000) {
            if (this.size.toLowerCase() != "xs") {
              this.dataSource.data.splice(
                this.dataSource.data.indexOf(item),
                1
              );
              this.dataSource = new MatTableDataSource(this.newList);
              setTimeout(() => {
                this.dataSource.paginator = this.paginator;
              }, 200);
              if (this.dataSource.data.length == 0) {
                this._router.navigate([`pages/activities`], { queryParams: { 
                  fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                  SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
              }
            } else {
              this.newList.splice(this.newList.indexOf(item), 1);
              if (this.newList.length == 0) {
                this._router.navigate([`pages/activities`], { queryParams: { 
                  fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                  SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
              }
            }
            this._alertService.success(
              !this.isArabic ? 
              "You approved the “" +
                item.description +
                "” activity.Now you can find it under the “Following” tab."
                : `لقد وافقت على نشاط ${item.description}. يمكنك الآن العثور عليه ضمن النشاطات التابعة لك.`,
              {
                timeout: 3000,
              }
            );
            //this.isElementBtnClicked = false;
          } else {
            this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
              timeout: 3000,
            });
            //this.isElementBtnClicked = false;
          }
        }
      });
  }

  doAcceptAction(item) {
    //this.isElementBtnClicked = true;
    if(item.isShared){
      this.claim(item);
    }else{
      if (this.listType == "assigned") {
        this.acceptAssigned(item);
      } else {
        this.approveReported(item);
      }
    }

  }

  changePreStyle(rowId, dataSource, index?) {
    if (dataSource != null) {
      let rows = dataSource.filteredData;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id == rowId) {
          rows[i].isHover = true;
          if (i != 0) {
            rows[i - 1].isRowBefore = true;
          } else {
            if (index != undefined) {
              this.isFirstRowInGroup[index] = true;
            } else {
              this.isFirstRow = true;
            }
          }
        }
      }
    }
  }

  resetPreStyle(dataSource) {
    this.isFirstRow = false;

    this.isFirstRowInGroup = [];

    dataSource.filteredData.forEach((row) => {
      row.isHover = false;
      row.isRowBefore = false;
    });
  }

  openActivityDetails(row: Activity) {
   //if (!this.isElementBtnClicked) {
    // if (row.appType == 4) {
    //   this._router.navigate([`pages/activities/details/espAct/${row.id}`]);
    // } else 

    if(row.isShared){
      localStorage.setItem("preURL", "/pages/activities/new/assigned" );
    }
    if (row.appType == 3) {
      this._router.navigate([`pages/activities/details/${row.epmInfo.ParentProjectId}/epmAct/${row.epmInfo.TaskId}`],  {
        queryParams: {
          accessedFrom: 'carousel-details',
          listType:this.listType,
          listLength:this.newList.length,
          fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
          SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
        }
      });
    } else if (row.appType == 2) {
        this._router.navigate([`pages/activities/details/oppProAct/${row.id}`], {
          queryParams: {
            accessedFrom: 'carousel-details',
            listType:this.listType,
            listLength:this.newList.length,
            fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
            SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
          }
        });
      } else if (row.appType == 1) {
        this._router.navigate([`pages/activities/details/engProAct/${row.id}`], {
          queryParams: {
            accessedFrom: 'carousel-details',
            listType:this.listType,
            listLength:this.newList.length,
            fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
            SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
          }
        });
      } else {
        this._router.navigate([`pages/activities/details/${row.id}`], {
          queryParams: {
            accessedFrom: 'carousel-details',
            listType:this.listType,
            listLength:this.newList.length,
            fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
            SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId
          }
        });
      }
  //  }
  }

  claim(item){
    this._activitiesService
        .claim(
          item.id
        )
        .subscribe((resp) => {
          if (!!resp) {
            if (resp.ResponseCode === 2000) {
              if (this.size.toLowerCase() != "xs") {
                this.dataSource.data.splice(
                  this.dataSource.data.indexOf(item),
                  1
                );
                this.dataSource = new MatTableDataSource(this.newList);
                setTimeout(() => {
                  this.dataSource.paginator = this.paginator;
                }, 200);
                if (this.dataSource.data.length == 0) {
                  this._router.navigate([`pages/activities`], { queryParams: { 
                    fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                    SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
                }
              } else {
                this.newList.splice(this.newList.indexOf(item), 1);
                if (this.newList.length == 0) {
                  this._router.navigate([`pages/activities`], { queryParams: { 
                    fromTab: this.fromTab, teamId: this.teamId, selectedTab: this.scoreCardSelectedTab,
                    SourceSystemId: this.SourceSystemId, SourceTenantId: this.SourceTenantId, SourceObjectTypeId: this.SourceObjectTypeId, SourceObjectId: this.SourceObjectId }});
                }
              }
              this._alertService.success(
                !this.isArabic ? 
                "You claimed the “" +
                  item.description +
                  "” activity.Now you can find it under the “Mine” tab."
                : `لقد قبلت نشاط ${item.description}. يمكنك الآن العثور عليه ضمن النشاطات الخاصة بك.`,
                {
                  timeout: 3000,
                }
              );
              

            } else {
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 300,
              });
            }
          }
        });
  }
}
