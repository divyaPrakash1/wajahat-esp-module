import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable, forkJoin} from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmpty, upperCase, lowerCase, uniq, capitalize} from 'lodash';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProjectDetailService } from '../detail/detail.service';
import { HistoryService } from 'src/app/shared/services/history.service';

export interface User {
  id: number;
  name: string;
}
export interface Group {
  groupId: number;
  isDefault: boolean;
  title: string;
}
export interface Category {
  categoryId: number;
  categoryText: string;
  categoryColor: string;
}

@Component({
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.scss']
})
export class ProjectAddComponent implements OnInit {
  validPattern = '^[a-zA-Z0-9]$';
  step = 1;
  isEditing = false;
  editId = 0;
  projectDetail: any = {};

  groupList: Group[] = [];
  ownerList: User[] = [];
  categoryList: Category[] = [];
  selectedCategory: any = {};
  typeList: Array<any> = [];
  selectedType: any = [];
  listToShow: Array<any> = [];
  requirementList: Array<any> = [];
  stageList: Array<any> = [];
  platformList: Array<any> = [{
    id: 0,
    name: new FormControl(''),
    percentage: new FormControl('')
  }];

  projectForm: FormGroup;

  filteredOwner: Observable<User[]> | undefined;
  filteredGroup: Observable<Group[]> | undefined;
  filteredCategory: Observable<Category[]> | undefined;
  checked = true;
  newProject: any = {
    list: [],
    requirements: {
      revenue: new FormControl(1),
      cost: new FormControl(1),
      efforts: new FormControl(1),
      points: new FormControl(1),
      startDate: new FormControl(1),
      endDate: new FormControl(1),
    },
    isStagesEnabled: new FormControl(false),
    isPlatformsEnabled: new FormControl(false),
    stages: [],
    platforms: [],
  };
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private authService: AuthService,
    private detailService: ProjectDetailService,
    private historyService: HistoryService
  ) {
    this.projectForm =  this.fb.group({
      name: [null, [Validators.required]],
      code: [null, [Validators.required]],
      group: [null, [Validators.required]],
      owner: [null, [Validators.required, this.checkPerson()]],
      startDate: [new Date()],
      dueDate: [null],
      type: [null, [Validators.required]],
      revenue: [null, [Validators.required]],
      cost: [null, [Validators.required]],
    });
    this.projectForm.get('startDate')?.setValidators([Validators.required, this.lessThanDueDate()]);
    this.projectForm.get('dueDate')?.setValidators([this.greaterThanStartDate()]);

    const params = this.activatedRoute.snapshot.params;
    if (params.id){
      this.isEditing = true;
      this.editId = params.id;
    }
  }
  ngOnInit(): void {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const allList = this.http.get(environment.baseURL + '/api/List/GetAllLists', {headers});
    const optionList = this.http.post(environment.baseURL + '/api/General/GetAllOptionSetsForAForm', {formTypeArray: ['ProjectOwners', 'ProjectRequirementEnforcement', 'DefaultProjectStages']}, {headers});
    const allGroups = this.http.get(environment.baseURL + '/api/Group/GetAllGroups');
    const allCategory = this.http.get(environment.baseURL + '/api/Type/GetAllTypes');
    const categoryByEntity = this.http.post(environment.baseURL + '/api/Type/GetAllTypesAssociatedToEntity', {
      entityId: this.editId,
      module: 'project'
    });

    const forkArray = [allList, optionList, allGroups, allCategory];
    if (this.isEditing){
      forkArray.push(categoryByEntity);
    }

    forkJoin(forkArray).subscribe((results: any) => {
      const listItems = results[0];
      const items: any = results[1];
      this.groupList = results[2].result;
      this.typeList = results[3].result.map((t: any) => {
        return {
          id: t.typeId,
          name: t.typeText,
          value: t.typeId,
        };
      });

      this.listToShow = listItems.result
      // tslint:disable-next-line: radix
        .sort((a: any, b: any) => (parseInt(a.sortIndex) > parseInt(b.sortIndex)) ? 1 : -1)
        .map((p: any) => {
        if (p.listSelectedByDefault === 1){
          p.disabled = true;
          this.newProject.list.push(p.listId);
        }
        return p;
      });

      const ownerList = items.result.find((r: any) => r.formType === 'ProjectOwners');
      this.ownerList = ownerList.result;

      const requirementList = items.result.find((r: any) => r.formType === 'ProjectRequirementEnforcement');
      this.requirementList = requirementList.result;

      const stageList = items.result.find((r: any) => r.formType === 'DefaultProjectStages');
      this.stageList = stageList.result.map((s: any) => {
        s.name = new FormControl(s.name);
        s.percentage = new FormControl('');
        return s;
      });

      if (this.isEditing){
        this.detailService.syncDetail(this.editId);
        this.detailService.getDetail.subscribe((d: any) => {
          if (!isEmpty(d)){
            console.log(d);
            const sgroup = this.groupList.find((g: any) => g.groupId === d.groupId);
            const sowner = this.ownerList.find((o: any) => o.id === d.projectOwnerId);
            this.projectDetail = d;
            this.projectForm.patchValue({
              name: d.projectName,
              code: d.projectCode,
              group: sgroup,
              owner: sowner,
              startDate: d.startDate,
              dueDate: d.dueDate,
              revenue: d.revenue,
              cost: d.cost,
            });
            const cat = results[4].result;
            if (cat.length > 0){
              this.selectedCategory = cat;
              this.selectedType = cat.map((s: any) => {
                return {
                  id: s.typeId,
                  name: s.typeText,
                  value: s.typeId,
                };
              });
              console.log(this.selectedType, this.typeList);
              this.projectForm.patchValue({type: this.selectedType});
            }
            const listsToShow = d.listsToShow.split(',');
            this.newProject.list = [];
            listsToShow.map((p: any) => {
              // tslint:disable-next-line: radix
              this.newProject.list.push(parseInt(p));
            });
            this.newProject.requirements.revenue.setValue(d.requirementsRevenueLevel);
            this.newProject.requirements.cost.setValue(d.requirementsCostLevel);
            this.newProject.requirements.efforts.setValue(d.requirementsEffortsLevel);
            this.newProject.requirements.points.setValue(d.requirementsPointsLevel);
            this.newProject.requirements.startDate.setValue(d.requirementsStartDateLevel);
            this.newProject.requirements.endDate.setValue(d.requirementsEndDateLevel);
            if (d.projectStages.length > 0){
              this.newProject.isStagesEnabled.setValue(true);
              this.stageList = [];
              d.projectStages.map((stage: any) => {
                this.stageList.push({
                  id: stage.projectStageId,
                  name: new FormControl(stage.stageName),
                  percentage: new FormControl({
                    value: stage.stagePercentage,
                    disabled: true
                  }),
                  saved: true
                });
              });
            }
            if (d.projectPlatforms.length > 0){
              this.newProject.isPlatformsEnabled.setValue(true);
              this.platformList = [];
              d.projectPlatforms.map((platform: any) => {
                this.platformList.push({
                  id: platform.projectPlatformId,
                  name: new FormControl(platform.platformName),
                  percentage: new FormControl({
                    value: platform.platformPercentage,
                    disabled: true
                  }),
                  saved: true
                });
              });
            }
            this.loading = false;
          }
        });

      }
      else{
        this.projectForm.patchValue({owner: this.ownerList.find(o => o.id === this.authService.userId)});
        const dgroup = this.groupList.find((g: any) => g.isDefault);
        this.projectForm.patchValue({group: dgroup});
        this.loading = false;
      }

    }, error => {
      this.snackbar.open('Something went wrong', '', {
        duration: 3000,
        horizontalPosition: 'start',
      });
      this.router.navigate(['/project/list']);
    });

    this.filteredOwner = this.projectForm.controls.owner.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterOwner(name) : this.ownerList.slice())
    );

    this.filteredGroup = this.projectForm.controls.group.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.title),
      map(title => title ? this._filterGroup(title) : this.groupList.slice())
    );
  }

  keyPressAlphaNumeric(event: KeyboardEvent): boolean {
    if (/[A-Za-z0-9]/.test(event.key)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressNumeric(event: KeyboardEvent): boolean {
    if (/[0-9]/.test(event.key)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  checkPerson(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      const controlValue = control.value;
      const res = controlValue === null ? -1 : this.ownerList.findIndex(el => el.id === controlValue.id);
      return res !== -1 ? null : { matched: true };
    };
  }
  lessThanDueDate(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      const dueDate: any = control.parent?.get('dueDate');
      const controlValue = control.value;
      const res = (controlValue === null || dueDate.value === null) ? true : new Date(controlValue) < new Date(dueDate.value);
      return res ? null : {matched: true};
    };
  }
  greaterThanStartDate(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      const startDate: any = control.parent?.get('startDate');
      const controlValue = control.value;
      const res = controlValue === null ? true : new Date(controlValue) > new Date(startDate.value);
      return res ? null : {matched: true};
    };
  }
  setAll(event: any): void{
    if (this.step <= 1){
      this.step = 2;
    }
    this.newProject.list.push(event.source.value);
  }
  displayOwner(user: User): string {
    return user && user.name ? user.name : '';
  }
  displayGroup(group: Group): string {
    return group && group.title ? group.title : '';
  }
  displayCategory(category: Category): string {
    return category && category.categoryText ? category.categoryText : '';
  }
  private _filterGroup(name: string): Group[] {
    const filterValue = name.toLowerCase();
    return this.groupList.filter(option => option.title.toLowerCase().indexOf(filterValue) === 0);
  }
  private _filterOwner(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.ownerList.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }
  private _filterCategory(name: string): Category[] {
    const filterValue = name.toLowerCase();
    return this.categoryList.filter(option => option.categoryText.toLowerCase().indexOf(filterValue) === 0);
  }
  typeSelected(event: any): void{
    console.log(event);
    this.projectForm.patchValue({
      type: event
    });
  }
  requirementSelect(event: any): void{
    if (this.step <= 2){
      this.step = 3;
    }
    console.log(event, this.newProject);
  }
  addNewStage(event: any): void{
    const emptyFound = this.stageList.find((s: any) => s.name == '');
    if (!emptyFound){
      this.stageList.push({
        id: (this.stageList.length + 2),
        name: new FormControl(''),
        percentage: new FormControl('')
      });
    }
  }
  deleteStage(event: any, stage: any): void{
    this.stageList = this.stageList.filter((s: any) => s.id !== stage.id);
  }
  addNewPlatform(event: any): void{
    const emptyFound = this.platformList.find((s: any) => s.name === '');
    if (!emptyFound){
      this.platformList.push({
        id: (this.platformList.length + 2),
        name: new FormControl(''),
        percentage: new FormControl('')
      });
    }
  }
  deletePlatform(event: any, stage: any): void{
    this.platformList = this.platformList.filter((s: any) => s.id !== stage.id);
  }
  newStageChanged(s: any): void{
    if ( s === 'stage' && this.step <= 3){
      this.step = 4;
    }
    else if (s === 'platform'){
      this.step = 5;
    }
  }
  getTotalPercentages(type: string): number{
    let total = 0;
    if (type === 'stage'){
      total = this.stageList.map((s: any) => Number(s.percentage.value)).reduce((prev, next) => (prev + next));
    }
    else if ('platform'){
      total = this.platformList.map((s: any) => Number(s.percentage.value)).reduce((prev, next) => (prev + next));
    }
    if (isNaN(total)){
      total = 0;
    }
    return total;
  }

  submitForm(event: any ): void{
    const totalStagePercentage: number = this.stageList
        .map((s: any) => Number(s.percentage.value))
        .reduce((prev, next) => (prev + next));

    const totalPlatformPercentage: number = this.platformList
        .map((s: any ) => Number(s.percentage.value))
        .reduce((prev, next) => (prev + next));
    if (this.newProject.isStagesEnabled.value && (this.stageList.length <= 0 || totalStagePercentage <= 0)){
      this.snackbar.open('At least one stage percentage required', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    }
    else if (this.newProject.isPlatformsEnabled.value && (this.platformList.length <= 0 || totalPlatformPercentage <= 0)){
      this.snackbar.open('At least one platform percentage required', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    }
    else if (this.newProject.isStagesEnabled.value && (totalStagePercentage < 0 || totalStagePercentage > 100)){
      this.snackbar.open('Sum of Stage Precentage should be equal to 100', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    }
    else if (totalPlatformPercentage < 0 || totalPlatformPercentage > 100){
      this.snackbar.open('Sum of Platform Precentage should be equal to 100', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    }
    else{
      const list = uniq(this.newProject.list);
      let stageList = this.stageList;
      let platformList = this.platformList;
      if (!this.newProject.isStagesEnabled.value){
        stageList = [
          {
            name : new FormControl('Default'),
            percentage: new FormControl('100'),
          }
        ];
      }
      if (!this.newProject.isPlatformsEnabled.value){
        platformList = [
          {
            name : new FormControl('Default'),
            percentage: new FormControl('100'),
          }
        ];
      }
      const data: any = {
        projectName: capitalize(this.projectForm.value.name),
        projectCode: upperCase(this.projectForm.value.code),
        projectOwnerId: this.projectForm.value.owner.id,
        projectOwnerName: this.projectForm.value.owner.name,
        groupId: this.projectForm.value.group.groupId,
        groupName: this.projectForm.value.group.title,
        scope: this.projectForm.value.dueDate ? 2 : 1,
        startDate: moment(this.projectForm.value.startDate).utc().format(),
        dueDate: this.projectForm.value.dueDate ? moment(this.projectForm.value.dueDate).utc().format() : null,
        revenue: this.projectForm.value.revenue || 0,
        cost: this.projectForm.value.cost || 0,
        isStagesEnabled: this.newProject.isStagesEnabled.value,
        isPlatformsEnabled: this.newProject.isPlatformsEnabled.value,
        listsToShow: list.join(','),
        requirementsRevenueLevel: this.newProject.requirements.revenue.value,
        requirementsCostLevel: this.newProject.requirements.cost.value,
        requirementsEffortsLevel: this.newProject.requirements.efforts.value,
        requirementsPointsLevel: this.newProject.requirements.points.value,
        requirementsStartDateLevel: this.newProject.requirements.startDate.value,
        requirementsEndDateLevel: this.newProject.requirements.endDate.value,
        createdOnDate: moment().utc().format(),
        describeValue: '',
        typeId: 0,
        historian: {},
        projectStages: stageList.map((s: any) => {
          return {
            projectStageId: 0,
            stageName: capitalize(s.name.value),
            stagePercentage: s.percentage.value,
            projectId: 0
          };
        }),
        projectPlatforms: platformList.map((p: any) => {
          return {
            projectPlatformId: 0,
            platformName: capitalize(p.name.value),
            platformPercentage: p.percentage.value,
            projectId: 0
          };
        })
      };
      if (this.isEditing){
        data.projectId = this.editId;
        data.LastModifiedBy = this.authService.userName;
        data.LastModifiedDate = moment().utc().format();

        let stagesFinal = this.stageList.map((s: any) => {
          const projectstage = this.projectDetail.projectStages.find((st: any) => st.projectStageId === s.id);
          return {
            projectStageId: projectstage ? projectstage.projectStageId : 0,
            stageName: capitalize(s.name.value),
            stagePercentage: Number(s.percentage.value),
            projectId: this.editId,
            action: !projectstage ? 1 : (lowerCase(s.name.value) === lowerCase(projectstage.stageName) ? 0 : 2)
          };
        });
        stagesFinal = stagesFinal.filter((s: any) => s.action !== 0);
        let platformFinal = this.platformList.map((p: any) => {
          const projectplat = this.projectDetail.projectPlatforms.find((st: any) => st.projectPlatformId === p.id);
          return {
            projectPlatformId: projectplat ? projectplat.projectPlatformId : 0 | 0,
            platformName: capitalize(p.name.value),
            platformPercentage: Number(p.percentage.value),
            projectId: this.editId,
            action: !projectplat ? 1 : (lowerCase(p.name.value) === lowerCase(projectplat.platformName) ? 0 : 2)
          };
        });
        platformFinal = platformFinal.filter((p: any) => p.action !== 0);
        this.historyService.createHistory({
          entityId: this.editId,
          entityName: 'project'
        });
        if(data.projectOwnerId != this.projectDetail.projectOwnerId){
          this.historyService.addHistory({
            "columnName": "owner",
            "descriptiveTitle": "update",
            "previousValueId": this.projectDetail.projectOwnerId,
            "previousValueName": this.projectDetail.projectOwnerName,
            "currentValueId": data.projectOwnerId,
            "currentValueName": data.projectOwnerName,
            "otherInfoOne": "",
            "otherInfoTwo": "",
            "otherInfoThree": "",
            "otherInfoFour": ""
          });
        }
        if(!moment(this.projectDetail.dueDate).isSame(data.dueDate)){
          this.historyService.addHistory({
            "columnName": "duedate",
            "descriptiveTitle": "update",
            "previousValueId": 0,
            "previousValueName": moment(this.projectDetail.dueDate).utc().format(),
            "currentValueId": 0,
            "currentValueName": data.dueDate,
            "otherInfoOne": "",
            "otherInfoTwo": "",
            "otherInfoThree": "",
            "otherInfoFour": ""
          });
        }
        if(data.revenue != this.projectDetail.revenue){
          this.historyService.addHistory({
            "columnName": "revenue",
            "descriptiveTitle": "update",
            "previousValueId": 0,
            "previousValueName": this.projectDetail.revenue,
            "currentValueId": 0,
            "currentValueName": data.revenue,
            "otherInfoOne": "",
            "otherInfoTwo": "",
            "otherInfoThree": "",
            "otherInfoFour": ""
          });
        }
        if(data.cost != this.projectDetail.cost){
          this.historyService.addHistory({
            "columnName": "cost",
            "descriptiveTitle": "update",
            "previousValueId": 0,
            "previousValueName": this.projectDetail.cost,
            "currentValueId": 0,
            "currentValueName": data.cost,
            "otherInfoOne": "",
            "otherInfoTwo": "",
            "otherInfoThree": "",
            "otherInfoFour": ""
          });
        }

        data.projectStages = stagesFinal;
        data.projectPlatforms = platformFinal;
        data.stagesChanged = stagesFinal.length > 0 ? true : false;
        data.platformsChanged = platformFinal.length > 0 ? true : false;
        data.describeValue = this.projectDetail.describeValue;
        data.projectStateId = this.projectDetail.projectStateId;
        data.projectStateName = this.projectDetail.projectStateName;
        data.projectStatusId = this.projectDetail.projectStatusId;
        data.projectStatusName = this.projectDetail.projectStatusName;
        data.historian = this.historyService.getHistory;
        this.loading = true;
        if (this.projectForm.value.type !== this.selectedType){
          if (this.selectedCategory.length > 0){
            const deAssociate = this.selectedCategory.map((t: any) => {
              return {
                TypeAssociationId: t.typeAssociationId,
              };
            });
            this.http.post(environment.baseURL + '/api/Type/DeAssociateTypeToEntity', deAssociate).subscribe();
          }
          const categoryDate = this.projectForm.value.type.map((t: any) => {
            return {
              typeId: t.id,
              entityId: this.editId,
              module: 'project'
            };
          });
          this.http.post(environment.baseURL + '/api/Type/AssociateTypeToEntity', categoryDate).subscribe();
        }
        this.http.put(environment.baseURL + '/api/Project/UpdateProject', data).subscribe((items: any) => {
          this.loading = false;
          this.router.navigate(['/project/' + this.editId]);
        }, error => {
          console.log(error);
          this.loading = false;
          this.snackbar.open(error.error.message || 'Something went wrong', '', {
            duration: 30000,
            panelClass: 'snackbar-xerror',
            horizontalPosition: 'start',
          });
          console.log(error);
        });
      }
      else{
        this.loading = true;
        this.historyService.createHistory({
          entityId: 0,
          entityName: 'project'
        });
        this.historyService.addHistory({
          "columnName": "owner",
          "descriptiveTitle": "created",
          "previousValueId": 0,
          "previousValueName": '',
          "currentValueId": data.projectOwnerId,
          "currentValueName": data.projectOwnerName,
          "otherInfoOne": "",
          "otherInfoTwo": "",
          "otherInfoThree": "",
          "otherInfoFour": ""
        });
        this.historyService.addHistory({
          "columnName": "duedate",
          "descriptiveTitle": "created",
          "previousValueId": 0,
          "previousValueName": '',
          "currentValueId": 0,
          "currentValueName": data.dueDate,
          "otherInfoOne": "",
          "otherInfoTwo": "",
          "otherInfoThree": "",
          "otherInfoFour": ""
        });
        this.historyService.addHistory({
          "columnName": "revenue",
          "descriptiveTitle": "created",
          "previousValueId": 0,
          "previousValueName": '',
          "currentValueId": 0,
          "currentValueName": data.revenue,
          "otherInfoOne": "",
          "otherInfoTwo": "",
          "otherInfoThree": "",
          "otherInfoFour": ""
        });
        this.historyService.addHistory({
          "columnName": "cost",
          "descriptiveTitle": "created",
          "previousValueId": 0,
          "previousValueName": '',
          "currentValueId": 0,
          "currentValueName": data.cost,
          "otherInfoOne": "",
          "otherInfoTwo": "",
          "otherInfoThree": "",
          "otherInfoFour": ""
        });
        data.historian = this.historyService.getHistory;
        data.CreatedBy = this.authService.userName;
        data.CreatedById = this.authService.userId;
        console.log(data);
        this.http.post(environment.baseURL + '/api/Project/AddProject', data).subscribe((items: any) => {
          console.log(items);
          const categoryDate = this.projectForm.value.type.map((t: any) => {
            return {
              typeId: t.id,
              entityId: items.result.projectId,
              module: 'project'
            };
          });
          this.http.post(environment.baseURL + '/api/Type/AssociateTypeToEntity', categoryDate).subscribe((category: any) => {
            this.loading = false;
            console.log(category);
            this.router.navigate(['/project/list']);
          }, error => {
            this.loading = false;
            this.router.navigate(['/project/list']);
          });
        }, error => {
          console.log(error);
          this.loading = false;
          this.snackbar.open('Something went wrong', '', {
            duration: 30000,
            panelClass: 'snackbar-xerror',
            horizontalPosition: 'start',
          });
        });
      }
    }
  }
}

