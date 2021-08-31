import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-requirement-acceptance-criteria',
  templateUrl: './requirement-acceptance-criteria.component.html',
  styleUrls: ['./requirement-acceptance-criteria.component.scss']
})
export class RequirementAcceptanceCriteriaComponent implements OnInit {
  @Input() entityid: string;

  loading = true;
  list: Array<any> = [];
  totalrecord = 0;
  fullList: Array<any> = [];
  pageNumber = 0;
  pageSize = 20;
  module = 'requirement';
  showForm = false;
  criteria = new FormControl('');
  popupLoading = true;
  allPopup = false;
  editPopup = false;
  selected: any = {};

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getSmallList();
  }
  getSmallList(): void{
    this.http.get(environment.baseURL + '/api/AcceptanceCriteria/GetAllAcceptanceCriterias?EntityId=' +
      this.entityid + '&Module=' + this.module + '&PageNo=0&PageSize=3').subscribe({
      next: (result: any) => {
        this.list = result.result.map((c: any) => {
          c.description = c.description.replaceAll('\n', '<br>');
          console.log(c);
          return c;
        });
        this.totalrecord = result.recordCount;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }
  getAllList(): void{
    this.http.get(environment.baseURL + '/api/AcceptanceCriteria/GetAllAcceptanceCriterias?EntityId=' +
      this.entityid + '&Module=' + this.module + '&PageNo='+this.pageNumber+'&PageSize='+this.pageSize).subscribe({
      next: (result: any) => {
        this.fullList = result.result.map((c: any) => {
          c.description = c.description.replaceAll('\n', '<br>');
          console.log(c);
          return c;
        });
        this.totalrecord = result.recordCount;
        this.popupLoading = false;
      },
      error: (error) => {
        this.popupLoading = false;
      }
    });
  }
  toggleForm(): void{
    this.showForm = !this.showForm;
  }
  submitForm(): void{
    if(this.criteria.value.length > 0){
      this.loading = true;
      this.http.post(environment.baseURL + '/api/AcceptanceCriteria/AddAcceptanceCriteria', {
        entityId: this.entityid,
        module: this.module,
        description: this.criteria.value,
      }).subscribe((items: any) => {
        this.showForm = false;
        this.criteria.setValue('');
        this.getSmallList();
      }, error => {
        this.snackbar.open(error.error.message || 'Something went wrong', '', {
          duration: 30000,
          panelClass: 'snackbar-xerror',
          horizontalPosition: 'start',
        });
      });
    }
  }
  toggleEdit(c: any): void{
    this.editPopup = !this.editPopup;
    if(c){
      this.criteria.setValue(c.description);
      this.selected = c;
      this.popupLoading = false;
    }
    else{
      this.criteria.setValue('');
    }
  }
  submitEditForm(): void{
    if(this.criteria.value.length > 0){
      this.popupLoading = true;
      this.http.post(environment.baseURL + '/api/AcceptanceCriteria/EditAcceptanceCriteria', {
        id: this.selected.id,
        entityId: this.entityid,
        module: this.module,
        description: this.criteria.value,
      }).subscribe((items: any) => {
        this.showForm = false;
        this.editPopup = false;
        this.popupLoading = false;
        this.loading = true;
        this.criteria.setValue('');
        this.getSmallList();
      }, error => {
        this.snackbar.open(error.error.message || 'Something went wrong', '', {
          duration: 30000,
          panelClass: 'snackbar-xerror',
          horizontalPosition: 'start',
        });
      });
    }
  }

  toggleAll(): void{
    if(!this.allPopup){
      this.allPopup = true;
      this.popupLoading = true;
      this.getAllList();
    }
    else{
      this.allPopup = false;
    }
  }
}
