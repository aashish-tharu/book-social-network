import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../services/services/book.service';
import { BorrowedBookResponse } from '../../../../services/models/borrowed-book-response';
import { PageResponseBorrowedBookResponse } from '../../../../services/models/page-response-borrowed-book-response';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-returned-books',
  imports: [CommonModule, Pagination],
  templateUrl: './returned-books.html',
  styleUrl: './returned-books.scss',
})
export class ReturnedBooks implements OnInit {
  page = 0;
  readonly size = 10;
  books: PageResponseBorrowedBookResponse = {};
  loading = false;
  errorMessage = '';
  notice = '';
  approvingBookId?: number;

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

  approveReturn(book: BorrowedBookResponse): void {
    if (book.id == null) {
      return;
    }
    this.errorMessage = '';
    this.notice = '';
    this.approvingBookId = book.id;
    this.bookService.approveBorrowedBook({ 'book-id': book.id }).subscribe({
      next: () => {
        this.approvingBookId = undefined;
        this.notice = 'Return approved — the book is available on your shelf again.';
        this.changeDetector.markForCheck();
        this.loadBooks();
      },
      error: (error) => {
        this.approvingBookId = undefined;
        this.errorMessage = error?.error?.errorMsg || 'This return could not be approved. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookService.findAllReturnedBooks({ page: this.page, size: this.size }).subscribe({
      next: (response) => {
        this.books = response;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Return requests could not be loaded. Please try again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
