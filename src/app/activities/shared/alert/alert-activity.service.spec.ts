import {TestBed} from '@angular/core/testing';
import { ActivityAlertService } from './alert-activity.service';

describe('ActivityAlertService', () => {
  let service: ActivityAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
