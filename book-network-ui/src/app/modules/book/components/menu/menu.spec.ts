import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menu } from './menu';
import { provideRouter } from '@angular/router';
import { TokenService } from '../../../../services/token/token';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [
        provideRouter([]),
        {
          provide: TokenService,
          useValue: {
            removeToken: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the Social Book Network brand', () => {
    expect(fixture.nativeElement.textContent).toContain('Social Book Network');
  });
});
