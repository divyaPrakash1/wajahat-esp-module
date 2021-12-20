import { TestBed, inject } from '@angular/core/testing';

import { CustomFieldFormService } from './custom-field-form-activity.service';

describe('CustomFieldFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomFieldFormService]
    });
  });

  it('should be created', inject([CustomFieldFormService], (service: CustomFieldFormService) => {
    expect(service).toBeTruthy();
  }));
});
