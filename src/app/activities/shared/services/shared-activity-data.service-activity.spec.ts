import { TestBed } from '@angular/core/testing';

import { SharedActivityDataService } from './shared-activity-data.service';

describe('SharedActivityDataService', () => {
  let service: SharedActivityDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedActivityDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
