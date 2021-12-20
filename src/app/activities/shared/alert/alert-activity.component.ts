import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import { Alert, AlertType } from './alert-activity.model';
import { ActivityAlertService } from './alert-activity.service';

@Component({
  selector: 'xcdrs-activity-alert',
  templateUrl: './alert-activity.component.html',
  styleUrls: ['./alert-activity.component.scss']
})


export class ActivityAlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  alertTypes = AlertType;
  @Output() isOpen: EventEmitter<boolean> = new EventEmitter<boolean>();
  private alertSub: Subscription = new Subscription();

  constructor(private alertService: ActivityAlertService) {
  }

  ngOnInit() {
    this.alertSub = this.alertService.getObservable().subscribe(alert => {
      this.addAlert(alert);
      this.isOpen.emit(true);
    });
  }

  ngOnDestroy() {
    this.alertSub.unsubscribe();
  }

  close(alert: Alert) {
    this.alerts = this.alerts.filter(alrt => alrt.id !== alrt.id);
    this.isOpen.emit(false);
  }

  className(alert: Alert): string {

    let style: string;

    switch (alert.type) {

      case AlertType.Success:
        style = 'success';
        break;

      case AlertType.Warning:
        style = 'warning';
        break;

      case AlertType.Error:
        style = 'error';
        break;

      default:
        style = 'info';
        break;
    }

    return style;
  }

  private addAlert(alert: Alert) {
    this.alerts.push(alert);

    if (alert.timeout !== 0) {
      setTimeout(() => this.close(alert), alert.timeout);
    }
  }
}
