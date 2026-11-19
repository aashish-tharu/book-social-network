import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../services/services/book.service';
import { BorrowedBookResponse } from '../../../../services/models/borrowed-book-response';
import { PageResponseBorrowedBookResponse } from '../../../../services/models/page-response-borrowed-book-response';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-borrowed-books',
  imports: [CommonModule, Pagination],
  templateUrl: './borrowed-books.html',
  styleUrl: './borrowed-books.scss',
})
export class BorrowedBooks implements OnInit {
  page = 0;
  readonly size = 10;
  books: PageResponseBorrowedBookResponse = {};
  loading = false;
  errorMessage = '';
  notice = '';
  returningBookId?: number;

  constructor(
    private readonly bookService: BookService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  changePage(page: number): void {
    this.page = page;
    this.loadBooks();
  }

  returnBook(book: BorrowedBookResponse): void {
    if (book.id == null) {
      return;
    }
    this.errorMessage = '';
    this.notice = '';
    this.returningBookId = book.id;
    this.bookService.returnBorrowedBook({ 'book-id': book.id }).subscribe({
      next: () => {
        this.returningBookId = undefined;
        this.notice = 'Return request sent to the owner.';
        this.changeDetector.markForCheck();
        this.loadBooks();
      },
      error: (error) => {
        this.returningBookId = undefined;
        this.errorMessage = error?.error?.errorMsg || 'This book could not be marked as returned.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookService.findAllBorrowedBooks({ page: this.page, size: this.size }).subscribe({
      next: (response) => {
        this.books = response;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Your borrowed books could not be loaded. Please try again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
