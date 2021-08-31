import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';

export interface DialogData {
  projectid: number;
}
export interface User {
  id: number;
  name: string;
}
@Component({
  selector: 'app-sprint-add',
  templateUrl: './sprint-add.component.html',
  styleUrls: ['./sprint-add.component.scss']
})
export class SprintAddComponent implements OnInit {
  dontShow = false;
  loading = true;
  projectId = 0;
  form: FormGroup;
  times = [];
  ownerList = [];
  filteredOwner: Observable<User[]> | undefined;
  emails: Array<any> = [];
  public emailValidators = [ this.mustBeEmail ];
  public errorMessages = {
    must_be_email: 'Enter valid email adress!'
  };

  constructor(
    public dialogRef: MatDialogRef<SprintAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.form =  this.fb.group({
      startDate: [new Date()],
      endDate: [null],
      owner: [null, [Validators.required, this.checkPerson()]],
      isReleased: [false],
    });
    this.form.get('startDate')?.setValidators([Validators.required, this.lessThanEndDate()]);
    this.form.get('endDate')?.setValidators([Validators.required, this.greaterThanStartDate()]);
  }

  ngOnInit(): void {
    this.projectId = this.data.projectid;
    console.log('add sprint', this.projectId);

    const optionSet = this.http.post(environment.baseURL + '/api/General/GetAllOptionSetsForAForm', {formTypeArray: ['ProjectOwners']});
    const timing = this.http.post(environment.baseURL + '/api/Sprint/GetAllSprintTimeFrames?ProjectId=' + this.projectId, {});

    forkJoin([optionSet, timing]).subscribe((results: any) => {
      const ownerList = results[0].result.find((r: any) => r.formType === 'ProjectOwners');
      this.ownerList = ownerList.result;
      this.form.patchValue({owner: this.ownerList.find(o => o.id === this.authService.userId)});

      this.times = results[1].result;

      this.loading = false;
    }, error => {
      this.snackbar.open('Something went wrong', '', {
        duration: 3000,
        horizontalPosition: 'start',
      });
      this.cancel();
    });

    this.filteredOwner = this.form.controls.owner.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterOwner(name) : this.ownerList.slice())
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
  lessThanEndDate(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      const endDate: any = control.parent?.get('endDate');
      if (endDate.touched && endDate.errors){
        endDate.updateValueAndValidity();
      }
      const controlValue = control.value;
      const res = (controlValue === null || endDate.value === null) ? true : new Date(controlValue) <= new Date(endDate.value);
      return res ? null : {matched: true};
    };
  }
  greaterThanStartDate(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      const startDate: any = control.parent?.get('startDate');
      console.log(startDate);
      if (startDate.touched && startDate.errors){
        startDate.updateValueAndValidity();
      }
      const controlValue = new Date(control.value).setHours(0, 0, 0, 0);
      const res = controlValue === null ? true : controlValue >= new Date(startDate.value).setHours(0, 0, 0, 0);
      return res ? null : {matched: true};
    };
  }
  displayOwner(user: User): string {
    return user && user.name ? user.name : '';
  }
  private _filterOwner(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.ownerList.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }
  private mustBeEmail(control: FormControl): any{
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (control.value !== '' && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return { must_be_email: true };
    }
    return null;
  }
  setRelease(event: any): void {
    this.form.patchValue({
      isReleased: event.checked,
    });
  }


  cancel(): void{
    this.dialogRef.close({});
    this.router.navigate([],  {queryParams: {}});
  }
  onSubmit(): void{
    let isDatePlanned = false;
    this.times.forEach((time) => {
      const startDate = moment(this.form.controls.startDate.value);
      const endDate = moment(this.form.controls.endDate.value);
      const from = moment.utc(time.startDate);
      const to = moment.utc(time.dueDate);
      if ((startDate.isSameOrAfter(from) && startDate.isSameOrBefore(to)) || (endDate.isSameOrAfter(from) && endDate.isSameOrBefore(to))){
        isDatePlanned = true;
      }
    });
    if (isDatePlanned){
      this.snackbar.open('The date is already planned', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
      return;
    }
    this.loading = true;
    const data = {
      title: (!this.form.value.isRelease ? 'Sprint - ' : 'Release - ') + moment(this.form.value.endDate).format('DD MMM, YYYY'),
      description: '',
      projectId: this.projectId,
      startDate: moment(this.form.value.startDate).startOf('day').utc().format(),
      dueDate: moment(this.form.value.endDate).endOf('day').utc().format(),
      groupingBaord: false,
      isRelease: this.form.value.isRelease,
      isRecurring: false,
      sprintRecurrenceOptions: {
        numberOfTimes: 0,
        repeatNumberOfTimes: 0,
        isWeeksSelected: false,
        isMonthsSelected: false,
        onDays: [],
        monthlyOnDay: 'FirstDay',
        repeatEndsOnDate: false,
        repeatEndsAfterNumberOfTimes: false,
        repeatEndDate: moment(this.form.value.endDate).utc().format()
      },
      reviewMeetingAttendees: JSON.stringify(this.emails.map((e) => e.value)),
      plannedCompletion: 0,
      ownerId: this.form.value.owner.id,
      createdById: this.authService.userId,
      createdOnDate: moment().utc().format(),
      parentSprintId: -1
    };
    this.http.post(environment.baseURL + '/api/Sprint/AddSprint', data).subscribe({
      next: (result: any) => {
        this.router.navigate([],  {queryParams: {}});
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while creating sprint', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }
}
