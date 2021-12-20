export class Alert {
  id: number;
  type: AlertType;
  message: string;
  timeout: number;

  constructor(init?: Partial<Alert>) {
    Object.assign(this, init);
  }
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}
