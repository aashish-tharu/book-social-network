import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookRequest } from '../../../../services/models/book-request';
import { BookService } from '../../../../services/services/book.service';

@Component({
  selector: 'app-book-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  book: BookRequest = {
    title: '',
    authorName: '',
    isbn: '',
    synopsis: '',
    shareable: false,
  };
  bookId?: number;
  coverFile?: File;
  isSaving = false;
  errorMessage = '';
  isEditing = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookService: BookService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('bookId');
    if (!id) {
      return;
    }
    this.bookId = Number(id);
    this.isEditing = true;
    if (!Number.isInteger(this.bookId) || this.bookId <= 0) {
      this.errorMessage = 'That book could not be found.';
      return;
    }
    this.bookService.findBookById({ 'book-id': this.bookId }).subscribe({
      next: (response) => {
        this.book = {
          id: response.id,
          title: response.title ?? '',
          authorName: response.authorName ?? '',
          isbn: response.isbn ?? '',
          synopsis: response.synopsis ?? '',
          shareable: response.shareable ?? false,
        };
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Book details could not be loaded. You may not have permission to edit it.';
        this.changeDetector.markForCheck();
      },
    });
  }

  selectCover(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    this.coverFile = undefined;
    if (!selected) {
      return;
    }
    if (!selected.type.startsWith('image/')) {
      this.errorMessage = 'Choose an image file for the cover.';
      input.value = '';
      return;
    }
    this.errorMessage = '';
    this.coverFile = selected;
  }

  save(): void {
    this.errorMessage = '';
    this.isSaving = true;
    this.bookService.saveBook({ body: this.book }).subscribe({
      next: (id) => {
        this.bookId = id;
        if (this.coverFile) {
          this.uploadCover(id, this.coverFile);
          return;
        }
        this.finishSave();
      },
      error: (error) => {
        this.errorMessage = error?.error?.errorMsg || 'Your book could not be saved. Check the details and try again.';
        this.isSaving = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/books/my-books']);
  }

  private uploadCover(id: number, file: File): void {
    this.bookService.uploadBookCoverPicture({
      'book-id': id,
      body: { file },
    }).subscribe({
      next: () => this.finishSave(),
      error: () => {
        this.errorMessage = 'The book was saved, but its cover could not be uploaded.';
        this.isSaving = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  private finishSave(): void {
    this.isSaving = false;
    void this.router.navigate(['/books/my-books']);
  }
}
