import { TestBed } from '@angular/core/testing';

import { TokenInterCeptorService } from './token-inter-ceptor.service';

describe('TokenInterCeptorService', () => {
  let service: TokenInterCeptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenInterCeptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
