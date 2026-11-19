import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../services/services/book.service';
import { PageResponseBookResponse } from '../../../../services/models/page-response-book-response';
import { BookResponse } from '../../../../services/models/book-response';
import { Router } from '@angular/router';
import { BookCard } from '../../components/book-card/book-card';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, BookCard, Pagination],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList implements OnInit{
  page = 0;
  size = 10;
  bookResponse: PageResponseBookResponse = {};
  loading = false;
  errorMessage = '';
  notice = '';

  constructor(
    private bookService: BookService,
    private router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.findAllBooks();
  }

  private findAllBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookService.findAllBooks({
      page: this.page,
      size: this.size
    }).subscribe({
      next: (books) => {
        this.bookResponse = books;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Books could not be loaded. Please try again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  changePage(page: number): void {
    this.page = page;
    this.findAllBooks();
  }

  onBookDetails(book: BookResponse): void {
    if (book.id != null) {
      this.router.navigate(['/books', book.id]);
    }
  }

  onBorrowBook(book: BookResponse): void {
    if (book.id == null) {
      return;
    }

    this.notice = '';
    this.errorMessage = '';
    this.bookService.borrowBook({ 'book-id': book.id }).subscribe({
      next: () => {
        this.notice = 'Borrow request sent. It will appear under My loans after the owner approves it.';
        this.changeDetector.markForCheck();
        this.findAllBooks();
      },
      error: (error) => {
        this.errorMessage = error?.error?.errorMsg || 'This book could not be borrowed. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
