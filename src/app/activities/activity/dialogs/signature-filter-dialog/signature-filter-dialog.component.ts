import { Component, OnInit, Inject } from "@angular/core";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";
import { ActivitiesService } from "../../services/activities.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  FormBuilder,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { StemeXeListType } from "../../enums";
import { delay } from "rxjs/operators";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import * as moment from "moment";
import { ActivatedRoute } from "@angular/router";
import { ActivityAlertService } from "../../../shared/alert/alert-activity.service";

@Component({
  selector: "xcdrs-signature-filter-dialog",
  templateUrl: "./signature-filter-dialog.component.html",
  styleUrls: ["./signature-filter-dialog.component.scss"],
})
export class SignatureFilterDialog implements OnInit {
  size: any;
  employee: any;
  selectedEmployee: any;
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  isError: boolean = false;
  form: FormGroup;
  teams: any[];
  jobs: any[];
  assignors: any[];
  userId: number;
  statusFilter = [
    { id: 2, name: "Done", selected: true, type: "status" },
    { id: 4, name: "Cancelled", selected: true, type: "status" },
  ];

  signedFilter = [
    { id: 1, name: "Signed", selected: true, type: "signed" },
    { id: 0, name: "Not Signed", selected: true, type: "signed" },
  ];
  employees = [];
  isImportant: boolean = false;
  isFollowing: boolean = false;
  allAssignorsSelected: boolean = false;
  allProjectsSelected: boolean = false;
  allJobsSelected: boolean = false;

  appliedFiltersIds: any;
  appliedFiltersObjs: any;
  isBacklog: boolean = false;
  engagementProLoggedInUserId: any = null;

  allAssignorsOpt = {
    id: -2,
    name: "All",
    selected: false,
    type: "assignor",
  };

  allTeamsOpt = {
    id: -2,
    name: "All",
    selected: false,
    type: "team",
  };

  allJobsOpt = {
    id: -2,
    name: "All",
    selected: false,
    type: "tactic",
  };
  assignorsControl = new FormControl([]);
  jobsControl = new FormControl([]);
  projectsControl = new FormControl([]);
  isESPcomponent: boolean = false;
  isArabic: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ActivityResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: ActivityAlertService,
    private _actRoute: ActivatedRoute,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<SignatureFilterDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: number;
      selected: any;
      selectedFiltersIds: any;
      engProData: any;
      userId?: any;
      isShared?: boolean;
      isESPcomponent?: boolean;
      notShowSigned: boolean;
    }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x: any) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.getLanguage();
    this.isESPcomponent = !!this.data.isESPcomponent
      ? this.data.isESPcomponent
      : false;
    // if (!!this.data.isShared && this.data.isShared) {
    //   this.statusFilter = [
    //     { id: 6, name: "Not Started", selected: false, type: "status" },
    //     { id: 5, name: "In Progress", selected: false, type: "status" },
    //     { id: 2, name: "Done", selected: false, type: "status" },
    //     { id: 4, name: "Cancelled", selected: false, type: "status" },
    //   ];
    // }
    if (!!this.data.engProData && this.data.engProData.isEngProEnabled) {
      this.engagementProLoggedInUserId = this.data.engProData.engProLoggedInUserId;
    }

    this.isBacklog = this.data.type == StemeXeListType.Backlog ? true : false;

    this.form = this._fb.group({
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
      employee: new FormControl(null),
    });
    if (
      this.data.selectedFiltersIds &&
      this.data.selectedFiltersIds.GroupInfo
    ) {
      this.form.controls["fromDate"].setValue(
        this.data.selectedFiltersIds.GroupInfo.StartDate
      );
      this.form.controls["toDate"].setValue(
        this.data.selectedFiltersIds.GroupInfo.EndDate
      );
    }
    this.initFilters();
  }

  getLanguage(): void {
    let lang = JSON.parse(localStorage.getItem("preferredLanguage")) ?? undefined;
    if(lang) this.isArabic = lang.locale == 'ar' || false;
  }

  initFilters(): void {
    let data = {
      userName: null,
      ExcludeLoggedInUser: false,
    };
    this._activitiesService.searchUsers(data).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response) {
          this.employees = response.ResponseResult;
          this.form.controls["employee"].setValue(
            this.data.selectedFiltersIds.ownerUserIds
          );
          // this.employees.map((x) => {
          //   if (
          //     x.UserId == this.data.selectedFiltersIds.ownerUserIds
          //   ) {
             
          //     // this.employee = x.UserName;
          //   }
          // });
        }
      },
      (error: Error): void => {
        this.isLoading = false;
      }
    );
    this.isLoading = true;
    this._activitiesService
      .getFiltersForActiveList(this.data, this.engagementProLoggedInUserId)
      .subscribe(
        (resp: any) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              if (!!resp.ResponseResult.UserId) {
                //user
                this.userId = resp.ResponseResult.UserId;
              } else if (!!resp.ResponseResult.Creators) {
                //mine
                this.assignors = resp.ResponseResult.Creators.map(
                  (assignor) => {
                    return {
                      id: assignor.Id,
                      name: assignor.Value,
                      selected: false,
                      type: "assignor",
                    };
                  }
                );
              }

              !!this.assignors
                ? this.assignors.unshift(this.allAssignorsOpt)
                : "";
              this.jobs = resp.ResponseResult.Tactics.map((tactic) => {
                return {
                  id: tactic.Id,
                  name: tactic.Value,
                  selected: false,
                  type: "tactic",
                };
              });

              !!this.jobs ? this.jobs.unshift(this.allJobsOpt) : "";
              this.teams = resp.ResponseResult.Teams.map((team) => {
                return {
                  id: team.Id,
                  name: team.Value,
                  selected: false,
                  type: "team",
                };
              });

              !!this.teams ? this.teams.unshift(this.allTeamsOpt) : "";

              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
            } else {
              this.dataLoaded = true;
              this.isLoading = false;
              this.isError = false;
              this._alertService.error(!this.isArabic ? resp.ResponseMessage : this._activitiesService.arabicAlertErrorMessage, {
                timeout: 3000,
              });
            }
          }
        },
        (error: Error): void => {
          this.dataLoaded = false;
          this.isLoading = false;
          this.isError = true;
        }
      );
  }

  setSelectedItems(): void {
    if (!!this.data.selected && this.data.selected.length > 0) {
      this.data.selected.map((obj: any) => {
        if (obj.type == "status") {
          this.statusFilter = [
            { id: 2, name: "Done", selected: false, type: "status" },
            { id: 4, name: "Cancelled", selected: false, type: "status" },
          ];
        }
        if (obj.type == "signed") {
          this.signedFilter = [
            { id: 1, name: "Signed", selected: false, type: "signed" },
            { id: 0, name: "Not Signed", selected: false, type: "signed" },
          ];
        }
      });
      this.data.selected.forEach((item: any) => {
        if (item.type == "assignor") {
          this.assignors.forEach((assignor) => {
            item.id == assignor.id ? (assignor.selected = true) : "";
          });
        }
        if (item.type == "team") {
          this.teams.forEach((team: any) => {
            item.id == team.id ? (team.selected = true) : "";
          });
        }
        if (item.type == "tactic") {
          this.jobs.forEach((job: any) => {
            item.id == job.id ? (job.selected = true) : "";
          });
        }
        if (item.type == "priority") {
          this.isImportant = true;
        }
        if (item.type == "following") {
          this.isFollowing = true;
        }

        if (item.type == "status") {
          for (var i = 0; i < this.statusFilter.length; i++) {
            if (this.statusFilter[i].id == item.id) {
              this.statusFilter[i].selected = true;
            } else {
              //this.statusFilter[i].selected = false;
            }
          }
        }

        if (item.type == "signed") {
          for (var i = 0; i < this.signedFilter.length; i++) {
            if (this.signedFilter[i].id == item.id) {
              this.signedFilter[i].selected = true;
            } else {
              //this.signedFilter[i].selected = false;
            }
          }
        }

        if (item.type == "fromDate") {
          this.form
            .get("fromDate")
            .setValue(new Date(moment(item.name).format("LL")));
        }
        if (item.type == "toDate") {
          this.form
            .get("toDate")
            .setValue(new Date(moment(item.name).format("LL")));
        }
      });

      if (!!this.assignors) {
        if (
          this.assignors.filter((val) => val.id != -2 && val.selected).length ==
          this.assignors.filter((val) => val.id != -2).length
        ) {
          this.assignorsControl.patchValue([
            ...this.assignors.map((item) => item),
            // { id: -2, name: "All" },
          ]);
          this.allAssignorsSelected = true;
        } else {
          this.assignorsControl.patchValue([
            ...this.assignors.filter((item) => item.selected == true),
          ]);
          this.allAssignorsSelected = false;
        }
      }

      if (!!this.teams) {
        if (
          this.teams.filter((val) => val.id != -2 && val.selected).length ==
          this.teams.filter((val) => val.id != -2).length
        ) {
          this.projectsControl.patchValue([
            ...this.teams.map((item) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allProjectsSelected = true;
        } else {
          this.projectsControl.patchValue([
            ...this.teams.filter((item) => item.selected == true),
          ]);

          this.allProjectsSelected = false;
        }
      }

      if (!!this.jobs) {
        if (
          this.jobs.filter((val: any) => val.id != -2 && val.selected).length ==
          this.jobs.filter((val: any) => val.id != -2).length
        ) {
          this.jobsControl.patchValue([
            ...this.jobs.map((item: any) => item),
            // { id: -2, name: "All" },
          ]);
          this.allJobsSelected = true;
        } else {
          this.jobsControl.patchValue([
            ...this.jobs.filter((item: any) => item.selected == true),
          ]);
          this.allJobsSelected = false;
        }
      }
    } else {
      switch (this.data.type) {
        case StemeXeListType.Backlog:
          break;
        case StemeXeListType.User:
          // case StemeXeListType.Shared:
          for (var i = 0; i < this.statusFilter.length; i++) {
            if (
              this.statusFilter[i].id != 10 &&
              this.statusFilter[i].id != 11
            ) {
              this.statusFilter[i].selected = true;
            }
          }
         break;
        default:
          for (var i = 0; i < this.statusFilter.length; i++) {
            if (this.statusFilter[i].id == 5 || this.statusFilter[i].id == 6) {
              this.statusFilter[i].selected = true;
            }
          }
          for (var i = 0; i < this.signedFilter.length; i++) {
            this.signedFilter[i].selected = true;
          }
          break;
      }

      this.isFollowing = true;
      this.selectAll("assignors", this.assignors);
      this.selectAll("teams", this.teams);
      this.selectAll("jobs", this.jobs);
    }
  }

  selectAll(ctrl: any, list: any): void {
    if (!!list) {
      switch (ctrl) {
        case "assignors":
          this.assignorsControl.patchValue([
            ...list.map((item: any) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allAssignorsSelected = true;
          break;
        case "jobs":
          this.jobsControl.patchValue([
            ...list.map((item: any) => item),
            // { id: -2, name: "All" },
          ]);
          this.allJobsSelected = true;
          break;
        default:
          this.projectsControl.patchValue([
            ...list.map((item: any) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allProjectsSelected = true;
          break;
      }
    }
  }

  clearSelectedDate(type: number): void {
    if (type == 0) {
      this.form.get("fromDate").setValue(null);
    } else {
      this.form.get("toDate").setValue(null);
    }
  }
  onNoClick(): void {
    this.cancel();
  }

  cancel(): void {
    this._dialogRef.close();
  }

  getSigned(): boolean {
    // console.log("this.signedFilter[0].selected", this.signedFilter[0].selected);
    // console.log("this.signedFilter[1].selected", this.signedFilter[1].selected);
    if (
      (this.signedFilter[0].selected && this.signedFilter[1].selected) ||
      (!this.signedFilter[0].selected && !this.signedFilter[1].selected)
    ) {
      return null;
    } else if (this.signedFilter[0].selected) {
      return true;
    } else {
      return false;
    }
  }

  submit(): void {
    // console.log("111111111111111");
    this.appliedFiltersIds = {
      GroupType: 1,
      GroupInfo: {
        StartDate:
          this.form.value.fromDate != null ? this.form.value.fromDate : null,
        EndDate: this.form.value.toDate != null ? this.form.value.toDate : null,
      },
      StatusIds: this.getSelectedIds(this.statusFilter, "status"),
      SignedIds: this.getSelectedIdsForSign(this.signedFilter, "signed"),
      ownerUserIds: this.form.get('employee').value,
      IsSigned: this.getSigned(),
      FromFilter: true,
    };

    this.appliedFiltersObjs = {
      Creators: this.isBacklog
        ? null
        : this.getSelectedObjs(this.assignorsControl.value, "assignor"),
      FromDate:
        this.form.value.fromDate != null
          ? moment(this.form.value.fromDate).format("ll")
          : null,
      Status: this.isBacklog
        ? null
        : this.getSelectedObjs(this.statusFilter, "status"),
      Signed: this.isBacklog
        ? null
        : this.getSelectedObjsForSigned(this.signedFilter, "signed"),
      IsImportant: this.isImportant, //this.getSelectedObjs(this.priorityFilter),
      IsFollowed: this.isBacklog ? null : this.isFollowing,
      Teams: this.getSelectedObjs(this.projectsControl.value, "team"),
      Tactics: this.getSelectedObjs(this.jobsControl.value, "tactic"),
    };

    var objsArr: any = [];
    if (this.appliedFiltersObjs.Creators != null) {
      for (var i = 0; i < this.appliedFiltersObjs.Creators.length; i++) {
        objsArr.push(this.appliedFiltersObjs.Creators[i]);
      }
    }
    if (this.appliedFiltersObjs.Status != null) {
      for (var i = 0; i < this.appliedFiltersObjs.Status.length; i++) {
        objsArr.push(this.appliedFiltersObjs.Status[i]);
      }
    }
    if (this.appliedFiltersObjs.Signed != null) {
      for (var i = 0; i < this.appliedFiltersObjs.Signed.length; i++) {
        objsArr.push(this.appliedFiltersObjs.Signed[i]);
      }
    }
    if (this.appliedFiltersObjs.IsImportant) {
      objsArr.push({
        id: 0,
        name: "Important",
        selected: true,
        type: "priority",
      });
    }

    if (this.appliedFiltersObjs.IsFollowed && !this.isBacklog) {
      objsArr.push({
        id: 0,
        name: "Followed",
        selected: true,
        type: "following",
      });
    }

    if (this.appliedFiltersObjs.Teams != null) {
      for (var i = 0; i < this.appliedFiltersObjs.Teams.length; i++) {
        objsArr.push(this.appliedFiltersObjs.Teams[i]);
      }
    }
    if (this.appliedFiltersObjs.Tactics != null) {
      for (var i = 0; i < this.appliedFiltersObjs.Tactics.length; i++) {
        objsArr.push(this.appliedFiltersObjs.Tactics[i]);
      }
    }

    this.appliedFiltersObjs.fromDate != null && !this.isBacklog
      ? objsArr.push({
          id: 0,
          name: this.appliedFiltersObjs.fromDate,
          selected: true,
          type: "fromDate",
        })
      : "";

    this._dialogRef.close({
      ids: this.appliedFiltersIds,
      objs: objsArr,
      isDefault: this.isDefaultFilterApplied(),
    });
  }

  isDefaultFilterApplied(): boolean {
    var isDefault = false;

    if (
      (this.form.value.fromDate == null || this.form.value.fromDate == "") &&
      (this.form.value.toDate == null || this.form.value.toDate == "") &&
      !this.isImportant &&
      this.isFollowing &&
      this.getDefualtStatus() &&
      !!this.assignors &&
      this.allAssignorsSelected &&
      !!this.teams &&
      this.allProjectsSelected &&
      !!this.jobs &&
      this.allJobsSelected
    ) {
      isDefault = true;
    }

    return isDefault;
  }

  getDefualtStatus(): boolean {
    var isDefault = false;
    var selectedStatus = this.statusFilter.filter((item) => item.selected);
    switch (this.data.type) {
      case StemeXeListType.User:
        if (selectedStatus.length == 4) {
          selectedStatus.forEach((item) => {
            isDefault = item.id != 11 && item.id != 10 ? true : false;
          });
        } else {
          isDefault = false;
        }
        break;
      default:
        if (selectedStatus.length == 2) {
          selectedStatus.forEach((item) => {
            isDefault =
              item.id != 11 && item.id != 10 && item.id != 2 && item.id != 4
                ? true
                : false;
          });
        } else {
          isDefault = false;
        }
        break;
    }

    return isDefault;
  }
  getSelectedIds(array: any, type: any): any[] {
    let tempArr = [];
    if (!!array) {
      array.forEach((item) => {
        if (item.id != -2) {
          type != "status"
            ? tempArr.push(item.id)
            : item.selected
            ? tempArr.push(item.id)
            : "";
        }
      });
    }

    return tempArr.length > 0 ? tempArr : null;
  }

  getSelectedIdsForSign(array: any, type: any): any[] {
    let tempArr = [];
    if (!!array) {
      array.forEach((item) => {
        if (item.selected) {
          tempArr.push(item.id);
        }
      });
    }

    return tempArr.length > 0 ? tempArr : null;
  }

  getSelectedObjs(array: any, type: any): any[] {
    let tempArr = [];
    if (!!array) {
      array.forEach((item) => {
        if (item.id != -2) {
          type != "status"
            ? tempArr.push(item)
            : item.selected
            ? tempArr.push(item)
            : "";
        }
      });
    }
    return tempArr.length > 0 ? tempArr : null;
  }

  getSelectedObjsForSigned(array: any, type: any): any[] {
    let tempArr = [];
    if (!!array) {
      array.forEach((item) => {
        if (item.selected) {
          tempArr.push(item);
        }
      });
    }
    return tempArr.length > 0 ? tempArr : null;
  }
}
