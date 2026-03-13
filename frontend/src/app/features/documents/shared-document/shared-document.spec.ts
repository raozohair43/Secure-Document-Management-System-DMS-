import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedDocument } from './shared-document';

describe('SharedDocument', () => {
  let component: SharedDocument;
  let fixture: ComponentFixture<SharedDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedDocument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
