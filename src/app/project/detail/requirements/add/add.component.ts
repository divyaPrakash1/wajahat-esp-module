import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-add-requirements',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  @Output() closeForm = new EventEmitter<any>();
  @Input() selected:any;

  projectID = 0;
  projectDetail: any = {};
  activeInlineEdit = '';
  maxcost = 0;

  loading = true;
  requirementForm: FormGroup;
  requirementTitle = new FormControl('');
  requirementDescription = new FormControl('');
  revenue = new FormControl('');
  startDate = new FormControl('');
  endDate = new FormControl('');
  total  = 0;
  totalError = false;

  stageList: any = [];
  platformList: any = [];
  selectedValue: any = [];
  platformSwitch: any = [];
  priorityList: any = [];
  currency: any = {};
  isEditing = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    private fb: FormBuilder
  ) {
    const params = this.activatedRoute.snapshot.params;
    this.projectID = params.id;
    this.requirementForm = this.fb.group({
      title: [null, [Validators.required, Validators.maxLength(60)]],
      description: [null, [Validators.required, Validators.maxLength(500)]],
      revenue: [null, [Validators.required]],
      cost: [null, [Validators.required]],
      priority: [null, [Validators.required]],
      startDate: [null],
      dueDate: [null],
      stages: this.fb.array([]),
      platforms: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if(!isEmpty(this.selected)){
      console.log(this.selected);
      this.isEditing = true;
      this.requirementForm.patchValue({
        title: this.selected.title,
        description: this.selected.description,
        revenue: this.selected.revenue,
        cost: this.selected.budgetedCost,
        priority: this.selected.priority,
        startDate: this.selected.startDate,
        dueDate: this.selected.endDate,
      });
    }
    const detail = this.http.post(environment.baseURL + '/api/Project/GetProjectById', {
      projectId: this.projectID,
      currentDate: new Date().toISOString()
    });
    const helper = this.http.post(environment.baseURL + '/api/General/GetAllOptionSetsForAForm', {formTypeArray: ['Priority', 'DefaultCurrency']});

    forkJoin({detail, helper}).subscribe((results: any) => {
      this.projectDetail = results.detail.result;
      const helperResult = results.helper.result;
      this.priorityList = helperResult.find((r: any) => r.formType === 'Priority');
      this.priorityList = this.priorityList.result.map((p: any) => {
        p.json = p.extraInformation ? JSON.parse(p.extraInformation) : {};
        return p;
      });
      const currency = helperResult.find((r: any) => r.formType === 'DefaultCurrency');
      this.currency = currency.result[0];
      this.stageList = this.projectDetail.projectStages.map((s: any) => s.projectStageId);
      this.platformList = this.projectDetail.projectPlatforms.map((p: any) => p.projectPlatformId);
      this.projectDetail.projectStages.map((s: any) => {
        const platforms: any = {};
        this.projectDetail.projectPlatforms.map((p: any) => {
          this.platformSwitch.push({
            platformId: p.projectPlatformId,
            stageId: s.projectStageId,
            formControl: new FormControl(true),
          });
          platforms[p.projectPlatformId] = ((parseInt(s.stagePercentage) / 100) * p.platformPercentage).toFixed(1);
        });
        this.selectedValue[s.projectStageId] = platforms;
      });
      this.maxcost = this.projectDetail.remainingCost;
      this.requirementForm.get('cost')?.setValidators([Validators.required, Validators.max(this.maxcost)]);
      this.calculateTotal();

      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }
  keyPressNumeric(event: KeyboardEvent): boolean {
    const inp = String.fromCharCode(event.keyCode);
    if (/[0-9.]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressMaxLength(event: any, maxLength: any): boolean {
    const inp = event.target.value;
    console.log(inp, event, maxLength);
    if (inp.length < maxLength) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }


  stageSelection(id: any): void {
    const found = this.stageList.findIndex((p: any) => p === id);
    console.log(found, id);
    if (found >= 0){
      this.stageList.splice(found, 1);
    }
    else{
      this.stageList.push(id);
    }
    const stages = this.platformSwitch.filter((s: any) => s.stageId === id);
    if (stages.length > 0){
      stages.map((p: any) => {
        p.formControl.setValue(found >= 0 ? false : true);
      });
    }
  }
  platformSelection(id: any): void {
    const found = this.platformList.findIndex((p: any) => p === id);
    console.log(found, id);
    if (found >= 0){
      this.platformList.splice(found, 1);
    }
    else{
      this.platformList.push(id);
    }
    const platforms = this.platformSwitch.filter((s: any) => s.platformId === id);
    if (platforms.length > 0){
      platforms.map((p: any) => {
        p.formControl.setValue(found >= 0 ? false : true);
      });
    }
  }
  getPlatformNameByID(id: any): void {
    const platform = this.projectDetail.projectPlatforms.find((p: any) => p.projectPlatformId === id);
    return platform.platformName;
  }
  getStageNameByID(id: any): void {
    const stage = this.projectDetail.projectStages.find((p: any) => p.projectStageId === id);
    return stage.stageName;
  }
  onGridChange(event: any): void {
    const target: any = event.target;
    if (target){
      const value = target.value;
      const stageID = target.getAttribute('stage');
      const platformID = target.getAttribute('platform');
      console.log(value, stageID, platformID);
      this.selectedValue[stageID][platformID] = Math.abs(value);
      this.calculateTotal();
    }
  }
  getGridValue(stageID: any, platformID: any): string {
    return (this.selectedValue[stageID][platformID] || 0);
  }
  calculateTotal(): number{
    let total = 0;
    this.selectedValue.map((platforms: any, s: number) => {
      if (this.stageList.includes(s)){
        for (const [p, value] of Object.entries(platforms)) {
          const abc: any = value;
          if (this.platformList.includes(parseInt(p))){
            total = total + (Math.abs(abc) || 0);
          }
        }
      }
    });
    this.total = parseFloat(total.toFixed(1));
    if (this.total > 100){
      this.totalError = true;
    }
    else{
      this.totalError = false;
    }
    return total;
  }
  getDateinView(): string{
    const startDate = this.requirementForm.value.startDate;
    const dueDate = this.requirementForm.value.dueDate;
    let result = '';
    if (startDate){
      result = moment(startDate).format('DD MMM, YYYY');
    }
    if (startDate && dueDate){
      result += ' - ';
    }
    if (dueDate){
      result += moment(dueDate).format('DD MMM, YYYY');
    }
    return result;
  }
  getPlatformToggle(stageID: any, platformID: any): void{
    const form = this.platformSwitch.find((s: any) => s.stageId === stageID && s.platformId === platformID);
    if (form){
      return form.formControl;
    }
  }
  getTotalDeliverable(): number{
    const num = this.platformSwitch.filter((s: any) => s.formControl.value);
    return num.length;
  }

  onSubmit(): void {
    if(this.isEditing){
      const data = {
        requirementId: this.selected.requirementId,
        projectId: this.selected.projectId,
        title: this.requirementForm.value.title,
        description: this.requirementForm.value.description,
        revenue: this.requirementForm.value.revenue,
        startDate: moment(this.requirementForm.value.startDate).utc().format(),
        endDate: moment(this.requirementForm.value.dueDate).utc().format(),
        plannedCost: this.selected.plannedCost,
        budgetedCost: this.requirementForm.value.cost,
        priority: this.requirementForm.value.priority,
        lastModifiedOn: moment().utc().format(),
        modifiedBy: this.authService.userId
      };
      this.loading = true;
      
      this.http.post(environment.baseURL + '/api/Requirements/EditRequirement', data).subscribe((results: any) => {
        this.loading = false;
        this.closeForm.emit({reload: true});
      }, error => {
        this.loading = false;
        this.snackbar.open(error.error.message || 'Something went wrong', '', {
          duration: 30000,
          panelClass: 'snackbar-xerror',
          horizontalPosition: 'start',
        });
        console.log(error);
      });
      return;
    }
    if (this.totalError){
      return;
    }
    else if (this.maxcost < this.requirementForm.value.cost){
      this.snackbar.open('Cost shouldn\'t be greater than '+this.maxcost, '', {
        duration: 30000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
      return;
    }
    else{
      const data = {
        projectId: this.projectID,
        title: this.requirementForm.value.title,
        description: this.requirementForm.value.description,
        revenue: this.requirementForm.value.revenue,
        startDate: moment(this.requirementForm.value.startDate).utc().format(),
        endDate: moment(this.requirementForm.value.dueDate).utc().format(),
        plannedCost: 0,
        budgetedCost: this.requirementForm.value.cost,
        createdOnDate: moment().utc().format(),
        createdById: this.authService.userId,
        ownerId: this.authService.userId,
        ownerName: this.authService.userName,
        plannedRevenue: 0,
        actualRevenue: 0,
        actualCost: 0,
        priority: this.requirementForm.value.priority,
        stages: Array<any>(),
        platforms: Array<any>()
      };
      for (const key of this.projectDetail.projectStages){
        if (this.stageList.includes(key.projectStageId)){
          data.stages.push({
            requirementStageId: 0,
            stageName: key.stageName,
            stagePercentage: key.stagePercentage || 0,
            requirementId: 0
          });
        }
      }
      for (const key of this.projectDetail.projectPlatforms){
        if (this.platformList.includes(key.projectPlatformId)){
          data.platforms.push({
            requirementPlatformId: 0,
            platformName: key.platformName,
            platformPercentage: key.platformPercentage || 0,
            requirementId: 0
          });
        }
      }
      this.loading = true;
      this.http.post(environment.baseURL + '/api/Requirements/AddRequirement', data).subscribe((results: any) => {
        const requirementId = results.result.requirementId;

        const deliverableList: any = [];
        for (const stage of this.projectDetail.projectStages){
          if (this.stageList.includes(stage.projectStageId)){
            for (const platform of this.projectDetail.projectPlatforms){
              let form = this.platformSwitch.find((s: any) =>
                      s.stageId === stage.projectStageId && s.platformId === platform.projectPlatformId);
              if (form){
                form = form.formControl.value;
              }
              if (this.platformList.includes(platform.projectPlatformId) && form){
                const stageFromReq = results.result.stages.find((st: any) => st.stageName === stage.stageName);
                const platformFromReq = results.result.platforms.find((st: any) => st.platformName === platform.platformName);
                deliverableList.push({
                  requirementId,
                  stageId: stageFromReq.requirementStageId,
                  platformId: platformFromReq.requirementPlatformId,
                  percentage: this.getGridValue(stage.projectStageId, platform.projectPlatformId),
                  revenue: 0,
                  budgetedCost: 0,
                  plannedCost: 0,
                  actualCost: 0,
                  plannedEffort: 0,
                  actualEffort: 0,
                  stageName: stage.stageName,
                  platformName: platform.platformName,
                  sprintId: 0,
                  sprintName: '',
                  createdOnDate: moment().utc().format(),
                  createdById: this.authService.userId
                });
              }
            }
          }
        }
        this.http.post(environment.baseURL + '/api/Deliverables/AddDeliverable', deliverableList).subscribe((results: any) => {
          this.loading = false;
          this.closeForm.emit({reload: true});
        }, error => {
          this.loading = false;
          this.closeForm.emit({reload: true});
          console.log(error);
        });
      }, error => {
        this.loading = false;
        this.snackbar.open(error.error.message || 'Something went wrong', '', {
          duration: 30000,
          panelClass: 'snackbar-xerror',
          horizontalPosition: 'start',
        });
        console.log(error);
      });
      console.log(data);
    }
  }
  onClose(): void {
    this.closeForm.emit();
  }
}
