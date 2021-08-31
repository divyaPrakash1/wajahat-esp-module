import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ProjectSprintsService } from '../sprints.service';
import { DeliverableMarkDoneComponent } from '../deliverable-mark-done/deliverable-mark-done.component';
import { DeliverableMarkMissedComponent } from '../deliverable-mark-missed/deliverable-mark-missed.component';
import { DeliverableRemoveComponent } from '../deliverable-remove/deliverable-remove.component';
import { DeliverableReopenComponent } from '../deliverable-reopen/deliverable-reopen.component';

@Component({
  selector: 'app-sprint-detail',
  templateUrl: './sprint-detail.component.html',
  styleUrls: ['./sprint-detail.component.scss']
})
export class SprintDetailComponent implements OnInit, OnDestroy {
  @Input() id: string;
  tabs: Array<any> = [
    {
      name: 'Details',
      link: 'detail'
    },
    {
      name: 'Deliverables',
      link: 'deliverable'
    },
  ];
  module = 'sprints';
  activeLink = 'deliverable';
  showdescription = false;
  description = new FormControl('');
  loading = true;
  detail: any = {};
  subscription: any = of('');

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private router: Router,
    private sprintsService: ProjectSprintsService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.getDetail();
    this.subscription = this.sprintsService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.loading = false;
        this.detail = d;
        this.description.setValue(d.describeValue);
        this.http.post(environment.baseURL + '/api/Project/GetAllSignatures', {
          module: 'sprints',
          entityId: this.id
        }).subscribe((results: any) => {
          this.detail.signatureList = results.result.map((sign: any) => {
            return sign;
          });
        });
        if (!this.detail.isDeliverableLoaded){
          this.getAllDeliverables();
        }
      }
    });
  }
  ngOnDestroy(): void{
    this.detail = {};
    this.loading = true;
    this.subscription.unsubscribe();
  }
  getDetail(): void{
    this.sprintsService.syncDetail(this.id);
  }
  getAllDeliverables(): void{
    this.http.post(environment.baseURL + '/api/Sprint/GetAllDeliverablesInaSprint?SprintId=' + this.id, {}).subscribe({
      next: (result: any) => {
        this.detail.deliverableCounts = result.otherObject;
        this.detail.deliverables = result.result;
        this.detail.isDeliverableLoaded = true;
      },
      error: (err: any) => {
        this.detail.deliverables = [];
      }
    });
  }
  updateDetail(): any{
    this.sprintsService.syncDetail(this.id);
  }
  toggleDescription(): void{
    this.showdescription = !this.showdescription;
  }

  onMarkDone(selected: any): void{
    const dialog = this.dialog.open(DeliverableMarkDoneComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.deliverableId
      }
    });
    dialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.getAllDeliverables();
      }
    });
  }
  onMarkMissed(selected: any): void{
    const dialog = this.dialog.open(DeliverableMarkMissedComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.deliverableId
      }
    });
    dialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.getAllDeliverables();
      }
    });
  }
  onMarkPlan(selected: any): void{
    const dialog = this.dialog.open(DeliverableReopenComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.deliverableId
      }
    });
    dialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.getAllDeliverables();
      }
    });
  }
  onRemove(selected: any): void{
    const dialog = this.dialog.open(DeliverableRemoveComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        id: selected.deliverableId,
        sprint: this.id
      }
    });
    dialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.getAllDeliverables();
      }
    });
  }
}
