import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../../../services/services/book.service';
import { BookResponse } from '../../../../services/models/book-response';
import { PageResponseBookResponse } from '../../../../services/models/page-response-book-response';
import { BookCard } from '../../components/book-card/book-card';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-my-books',
  imports: [CommonModule, BookCard, Pagination],
  templateUrl: './my-books.html',
  styleUrl: './my-books.scss',
})
export class MyBooks implements OnInit {
  page = 0;
  readonly size = 10;
  books: PageResponseBookResponse = {};
  loading = false;
  errorMessage = '';
  notice = '';

  constructor(
    private readonly bookService: BookService,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  changePage(page: number): void {
    this.page = page;
    this.loadBooks();
  }

  createBook(): void {
    void this.router.navigate(['/books/manage/new']);
  }

  editBook(book: BookResponse): void {
    if (book.id != null) {
      void this.router.navigate(['/books/manage', book.id]);
    }
  }

  viewDetails(book: BookResponse): void {
    if (book.id != null) {
      void this.router.navigate(['/books', book.id]);
    }
  }

  toggleShare(book: BookResponse): void {
    if (book.id == null) {
      return;
    }
    this.bookService.updateShareableStatus({ 'book-id': book.id }).subscribe({
      next: () => {
        this.notice = book.shareable ? 'This book is no longer shared.' : 'Your book is now shared with the community.';
        this.loadBooks();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Sharing status could not be changed. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  toggleArchive(book: BookResponse): void {
    if (book.id == null) {
      return;
    }
    this.bookService.updateArchivedStatus({ 'book-id': book.id }).subscribe({
      next: () => {
        this.notice = book.archived ? 'Book restored to your shelf.' : 'Book archived.';
        this.loadBooks();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Archive status could not be changed. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.changeDetector.markForCheck();
    this.bookService.findAllBooksByOwner({ page: this.page, size: this.size }).subscribe({
      next: (response) => {
        this.books = response;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Your shelf could not be loaded. Please try again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
