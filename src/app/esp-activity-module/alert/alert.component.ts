import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Alert, AlertType} from './alert.model';
import {Subscription} from 'rxjs';
import {AlertService} from './alert.service';

@Component({
  selector: 'xcdrs-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})


export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  alertTypes = AlertType;
  @Output() isOpen: EventEmitter<boolean> = new EventEmitter<boolean>();
  private alertSub: Subscription = new Subscription();

  constructor(private alertService: AlertService) {
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
