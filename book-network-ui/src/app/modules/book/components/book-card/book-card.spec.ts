import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCard } from './book-card';

describe('BookCard', () => {
  let component: BookCard;
  let fixture: ComponentFixture<BookCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the book metadata and uploaded cover', () => {
    fixture.componentRef.setInput('book', {
      title: 'Clean Code',
      authorName: 'Robert C. Martin',
      isbn: '9780132350884',
      owner: 'Jane Doe',
      synopsis: 'A practical guide to clean software.',
      rate: 4.5,
      shareable: true,
      cover: ['aW1hZ2U='],
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const cover = fixture.nativeElement.querySelector('.book-cover') as HTMLImageElement;

    expect(text).toContain('Clean Code');
    expect(text).toContain('Robert C. Martin');
    expect(text).toContain('9780132350884');
    expect(text).toContain('Jane Doe');
    expect(text).toContain('A practical guide to clean software.');
    expect(text).toContain('4.5');
    expect(cover.getAttribute('src')).toBe('data:image/jpeg;base64,aW1hZ2U=');
  });
});
