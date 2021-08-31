import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { delay } from 'rxjs/operators';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { MatOption } from '@angular/material/core';
import { conformToMask } from 'angular2-text-mask';
import { AlertService } from '../../../alert/alert.service';
import { ActivitiesService } from '../../../services/activities.service';
import { ResizeService } from '../../../services/resize.service';
import { SCREEN_SIZE } from '../../../enums/shared.enums';
import { StemeXeListType } from '../../../enums/enums';

@Component({
  selector: "xcdrs-filters-dialog",
  templateUrl: './filters-dialog.html',
  styleUrls: ['./filters-dialog.scss'],
})
export class FiltersDialog implements OnInit {
  size: any;
  isLoading: boolean = false;
  dataLoaded: boolean = false;
  isError: boolean = false;
  form!: FormGroup;
  teams!: any[];
  jobs!: any[];
  assignors!: any[];
  userId!: number;
  statusFilter = [
    { id: 6, name: 'Not Started', selected: false, type: 'status' },
    { id: 5, name: 'In Progress', selected: false, type: 'status' },
    { id: 2, name: 'Done', selected: false, type: 'status' },
    { id: 4, name: 'Cancelled', selected: false, type: 'status' },
    { id: 10, name: 'Approved', selected: false, type: 'status' },
    { id: 11, name: 'Rejected', selected: false, type: 'status' },
  ];

  priorityFilter = [
    { id: 1, name: 'Important', selected: false, type: 'priority' },
    { id: 0, name: 'Not Important', selected: false, type: 'priority' },
  ];

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
    name: 'All',
    selected: false,
    type: 'assignor',
  };

  allTeamsOpt = {
    id: -2,
    name: 'All',
    selected: false,
    type: 'team',
  };

  allJobsOpt = {
    id: -2,
    name: 'All',
    selected: false,
    type: 'tactic',
  };
  assignorsControl = new FormControl([]);
  jobsControl = new FormControl([]);
  projectsControl = new FormControl([]);
  isESPcomponent:boolean=false;
  constructor(
    private _fb: FormBuilder,
    private _resizeService: ResizeService,
    private _activitiesService: ActivitiesService,
    private _alertService: AlertService,
    private _actRoute: ActivatedRoute,
    public _dialog: MatDialog,
    public _dialogRef: MatDialogRef<FiltersDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { type: number; selected: any; engProData: any; userId?: any ; isShared?:boolean ; isESPcomponent?:boolean }
  ) {
    this._resizeService.onResize$.pipe(delay(0)).subscribe((x) => {
      this.size = SCREEN_SIZE[x];
    });
  }

  ngOnInit(): void {
    this.isESPcomponent = !!this.data.isESPcomponent? this.data.isESPcomponent:false;
    if(!!this.data.isShared && this.data.isShared){
      this.statusFilter = [
        { id: 6, name: 'Not Started', selected: false, type: 'status' },
        { id: 5, name: 'In Progress', selected: false, type: 'status' },
        { id: 2, name: 'Done', selected: false, type: 'status' },
        { id: 4, name: 'Cancelled', selected: false, type: 'status' },
      ];
    }
    if (!!this.data.engProData && this.data.engProData.isEngProEnabled) {
      this.engagementProLoggedInUserId = this.data.engProData.engProLoggedInUserId;
    }

    this.isBacklog = this.data.type == StemeXeListType.Backlog ? true : false;

    this.form = this._fb.group({
      dueDate: new FormControl(null),
      isImportant: new FormControl(false),
      isFollowing: new FormControl(false),
    });
    this.initFilters();
  }
  initFilters() {
    this.isLoading = true;
    this._activitiesService
      .getFiltersForActiveList(this.data, this.engagementProLoggedInUserId)
      .subscribe(
        (resp) => {
          if (!!resp) {
            if (resp.ResponseCode == 2000) {
              if (!!resp.ResponseResult.UserId) {
                //user
                this.userId = resp.ResponseResult.UserId;
              } else if (!!resp.ResponseResult.Creators) {
                //mine
                this.assignors = resp.ResponseResult.Creators.map(
                  (assignor:any) => {
                    return {
                      id: assignor.Id,
                      name: assignor.Value,
                      selected: false,
                      type: 'assignor',
                    };
                  }
                );
              }

              !!this.assignors
                ? this.assignors.unshift(this.allAssignorsOpt)
                : '';
              //for mine, following & backlog
              this.jobs = resp.ResponseResult.Tactics.map((tactic:any) => {
                return {
                  id: tactic.Id,
                  name: tactic.Value,
                  selected: false,
                  type: 'tactic',
                };
              });

              !!this.jobs ? this.jobs.unshift(this.allJobsOpt) : '';
              this.teams = resp.ResponseResult.Teams.map((team:any) => {
                return {
                  id: team.Id,
                  name: team.Value,
                  selected: false,
                  type: 'team',
                };
              });

              !!this.teams ? this.teams.unshift(this.allTeamsOpt) : '';

              this.setSelectedItems();
              this.dataLoaded = true;
              this.isError = false;
              this.isLoading = false;
            } else {
              this.dataLoaded = true;
              this.isLoading = false;
              this.isError = false;
              this._alertService.error(resp.ResponseMessage, {
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

  setSelectedItems() {
    if (!!this.data.selected && this.data.selected.length > 0) {
      this.data.selected.forEach((item:any) => {
        if (item.type == 'assignor') {
          this.assignors.forEach((assignor) => {
            item.id == assignor.id ? (assignor.selected = true) : '';
          });
        }
        if (item.type == 'team') {
          this.teams.forEach((team) => {
            item.id == team.id ? (team.selected = true) : '';
          });
        }
        if (item.type == 'tactic') {
          this.jobs.forEach((job) => {
            item.id == job.id ? (job.selected = true) : '';
          });
        }
        if (item.type == 'priority') {
          this.isImportant = true;
        }
        if (item.type == 'following') {
          this.isFollowing = true;
        }

        if (item.type == 'status') {
          for (var i = 0; i < this.statusFilter.length; i++) {
            if (this.statusFilter[i].id == item.id) {
              this.statusFilter[i].selected = true;
            }
          }
        }

        if (item.type == 'dueDate') {
          this.form.get('dueDate')?.setValue(new Date(moment(item.name).format('LL')));
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
          this.jobs.filter((val) => val.id != -2 && val.selected).length ==
          this.jobs.filter((val) => val.id != -2).length
        ) {
          this.jobsControl.patchValue([
            ...this.jobs.map((item) => item),
            // { id: -2, name: "All" },
          ]);
          this.allJobsSelected = true;
        } else {
          this.jobsControl.patchValue([
            ...this.jobs.filter((item) => item.selected == true),
          ]);
          this.allJobsSelected = false;
        }
      }
    } else {
      switch (this.data.type) {
        case StemeXeListType.Backlog:
          break;
        case StemeXeListType.User:
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
          break;
      }

      this.isFollowing = true;
      this.selectAll('assignors', this.assignors);
      this.selectAll('teams', this.teams);
      this.selectAll('jobs', this.jobs);
    }
  }

  selectAll(ctrl:any, list:any) {
    if (!!list) {
      switch (ctrl) {
        case 'assignors':
          this.assignorsControl.patchValue([
            ...list.map((item:any) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allAssignorsSelected = true;
          break;
        case 'jobs':
          this.jobsControl.patchValue([
            ...list.map((item:any) => item),
            // { id: -2, name: "All" },
          ]);
          this.allJobsSelected = true;
          break;
        default:
          this.projectsControl.patchValue([
            ...list.map((item:any) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allProjectsSelected = true;
          break;
      }
    }
  }

  clearSelectedDate() {
    this.form.get('dueDate')?.setValue(null);
  }
  onNoClick(): void {
    this.cancel();
  }

  cancel() {
    this._dialogRef.close();
  }

  submit() {
    this.appliedFiltersIds = {
      CreatorIds: this.isBacklog
        ? null
        : this.getSelectedIds(this.assignorsControl.value, 'assignor'),
      DueDate:
        this.form.value.dueDate != null
          ? moment(this.form.value.dueDate).format('ll')
          : null,
      StatusIds: this.isBacklog
        ? null
        : this.getSelectedIds(this.statusFilter, 'status'),
      IsImportant: this.isImportant, //this.getSelectedPriorities(),
      IsFollowed: this.isBacklog ? null : this.isFollowing,
      TeamIds: this.getSelectedIds(this.projectsControl.value, 'team'),
      TacticIds: this.getSelectedIds(this.jobsControl.value, 'tactic'),
    };

    this.appliedFiltersObjs = {
      Creators: this.isBacklog
        ? null
        : this.getSelectedObjs(this.assignorsControl.value, 'assignor'),
      DueDate:
        this.form.value.dueDate != null
          ? moment(this.form.value.dueDate).format('ll')
          : null,
      Status: this.isBacklog
        ? null
        : this.getSelectedObjs(this.statusFilter, 'status'),
      IsImportant:  this.isImportant, //this.getSelectedObjs(this.priorityFilter),
      IsFollowed: this.isBacklog ? null : this.isFollowing,
      Teams: this.getSelectedObjs(this.projectsControl.value, 'team'),
      Tactics: this.getSelectedObjs(this.jobsControl.value, 'tactic'),
    };

    var objsArr = [];
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
    if (this.appliedFiltersObjs.IsImportant ) {
      objsArr.push({
        id: 0,
        name: 'Important',
        selected: true,
        type: 'priority',
      });
    }

    if (this.appliedFiltersObjs.IsFollowed && !this.isBacklog) {
      objsArr.push({
        id: 0,
        name: 'Followed',
        selected: true,
        type: 'following',
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

    this.appliedFiltersObjs.DueDate != null && !this.isBacklog
      ? objsArr.push({
          id: 0,
          name: this.appliedFiltersObjs.DueDate,
          selected: true,
          type: 'dueDate',
        })
      : '';

    this._dialogRef.close({
      ids: this.appliedFiltersIds,
      objs: objsArr,
      isDefault: this.isDefaultFilterApplied(),
    });
  }

  isDefaultFilterApplied() {
    var isDefault = false;

    if (
      (this.form.value.dueDate == null || this.form.value.dueDate == '') &&
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

  getDefualtStatus() {
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
  getSelectedIds(array:any, type:any) {
    let tempArr:any[] = [];
    if (!!array) {
      array.forEach((item:any) => {
        if (item.id != -2) {
          type != 'status'
            ? tempArr.push(item.id)
            : item.selected
            ? tempArr.push(item.id)
            : '';
        }
      });
    }

    return tempArr.length > 0 ? tempArr : null;
  }

  getSelectedObjs(array:any, type:any) {
    let tempArr:any[] = [];
    if (!!array) {
      array.forEach((item:any) => {
        if (item.id != -2) {
          type != 'status'
            ? tempArr.push(item)
            : item.selected
            ? tempArr.push(item)
            : '';
        }
      });
    }
    return tempArr.length > 0 ? tempArr : null;
  }

  // onJobRemoved(job) {
  //   const jobs = this.form.value.job as string[];
  //   this.removeFirst(this.jobs, job);
  //   this.form.value.job.setValue(jobs);
  // }

  // onToppingRemoved(X) {}
  // onTeamRemoved(team) {
  //   const teams = this.form.value.team as string[];
  //   this.removeFirst(teams, team);
  //   this.form.value.team.setValue(teams);
  // }

  // onAssignorRemoved(assignor) {
  //   const assignors = this.form.value.assignor as string[];
  //   this.removeFirst(assignors, assignor);
  //   this.form.value.assignor.setValue(assignors);
  // }

  // removeFirst<T>(array: T[], toRemove: T): void {
  //   const index = array.indexOf(toRemove);
  //   if (index !== -1) {
  //     array.splice(index, 1);
  //   }
  // }

  toggleAllSelection(field:any) {
    switch (field) {
      case 'assignors':
        if (
          this.assignorsControl.value.find((val:any) => val.id === -2) &&
          !this.allAssignorsSelected
        ) {
          this.assignorsControl.patchValue([
            ...this.assignors.map((item) => item),
            //{ id: -2, name: "All" },
          ]);
          this.allAssignorsSelected = true;
        } else {
          this.assignorsControl.patchValue([]);
          this.allAssignorsSelected = false;
        }
        break;
      case 'jobs':
        if (
          this.jobsControl.value.find((val:any) => val.id === -2) &&
          !this.allJobsSelected
        ) {
          this.jobsControl.patchValue([
            ...this.jobs.map((item) => item),
            // { id: -2, name: "All" },
          ]);
          this.allJobsSelected = true;
        } else {
          this.jobsControl.patchValue([]);
          this.allJobsSelected = false;
        }
        break;
      default:
        if (
          this.projectsControl.value.find((val:any) => val.id === -2) &&
          !this.allProjectsSelected
        ) {
          this.projectsControl.patchValue([
            ...this.teams.map((item) => item),
            // { id: -2, name: "All" },
          ]);
          this.allProjectsSelected = true;
        } else {
          this.projectsControl.patchValue([]);
          this.allProjectsSelected = false;
        }
        break;
    }
  }

  toggleItem(field:any) {
    switch (field) {
      case 'assignors':
        this.assignorsControl.patchValue(
          this.assignorsControl.value.filter((val:any) => val.id != -2)
        );

        this.allAssignorsSelected = false;

        break;
      case 'jobs':
        this.jobsControl.patchValue(
          this.jobsControl.value.filter((val:any) => val.id != -2)
        );

        this.allJobsSelected = false;

        break;
      default:
        this.projectsControl.patchValue(
          this.projectsControl.value.filter((val:any) => val.id != -2)
        );

        this.allProjectsSelected = false;

        break;
    }
  }

  toggleSelection(field:any, id:any) {
    if (id == -2) {
      this.toggleAllSelection(field);
    } else {
      this.toggleItem(field);
    }
  }
}
