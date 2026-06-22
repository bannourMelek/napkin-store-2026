import { TestBed } from '@angular/core/testing';

import { GpioService } from './gpio.service';

describe('GpioService', () => {
  let service: GpioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
