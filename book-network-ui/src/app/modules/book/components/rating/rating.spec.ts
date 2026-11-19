import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rating } from './rating';

describe('Rating', () => {
  let component: Rating;
  let fixture: ComponentFixture<Rating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rating],
    }).compileComponents();

    fixture = TestBed.createComponent(Rating);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('emits a selected rating and ignores selection when readonly', () => {
    const changed = vi.spyOn(component.valueChange, 'emit');

    component.choose(4);
    expect(changed).toHaveBeenCalledWith(4);

    component.readonly = true;
    component.choose(2);
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
