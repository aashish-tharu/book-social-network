import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookResponse } from '../../../../services/models/book-response';
import { FeedbackResponse } from '../../../../services/models/feedback-response';
import { PageResponseFeedbackResponse } from '../../../../services/models/page-response-feedback-response';
import { BookService } from '../../../../services/services/book.service';
import { FeedbackService } from '../../../../services/services/feedback.service';
import { Pagination } from '../../components/pagination/pagination';
import { Rating } from '../../components/rating/rating';

@Component({
  selector: 'app-book-details',
  imports: [CommonModule, FormsModule, RouterLink, Pagination, Rating],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss',
})
export class BookDetails implements OnInit {
  book?: BookResponse;
  bookId?: number;
  feedbackPage = 0;
  readonly feedbackSize = 5;
  feedbacks: PageResponseFeedbackResponse = {};
  rating = 0;
  comment = '';
  loading = true;
  submitting = false;
  requestingBorrow = false;
  requestSent = false;
  errorMessage = '';
  notice = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly bookService: BookService,
    private readonly feedbackService: FeedbackService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('bookId'));
      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage = 'That book could not be found.';
        this.loading = false;
        this.changeDetector.markForCheck();
        return;
      }
      this.bookId = id;
      this.feedbackPage = 0;
      this.requestSent = false;
      this.loadBook();
      this.loadFeedback();
    });
  }

  changeFeedbackPage(page: number): void {
    this.feedbackPage = page;
    this.loadFeedback();
  }

  get bookCover(): string {
    const cover = this.book?.cover;
    if (!cover || (Array.isArray(cover) && cover.length === 0)) {
      return 'assets/book-cover-placeholder.svg';
    }

    const base64Cover = Array.isArray(cover) ? cover.join('') : String(cover);
    return base64Cover.startsWith('data:image')
      ? base64Cover
      : `data:image/jpeg;base64,${base64Cover}`;
  }

  requestBorrow(): void {
    if (this.bookId == null || this.requestingBorrow || this.requestSent) {
      return;
    }
    this.errorMessage = '';
    this.notice = '';
    this.requestingBorrow = true;
    this.bookService.borrowBook({ 'book-id': this.bookId }).subscribe({
      next: () => {
        this.requestingBorrow = false;
        this.requestSent = true;
        this.notice = 'Your request has been sent to the owner for approval.';
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.requestingBorrow = false;
        this.errorMessage = error?.error?.errorMsg || 'Your borrow request could not be sent. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  submitFeedback(): void {
    if (this.bookId == null || this.rating < 1 || this.rating > 5 || !this.comment.trim()) {
      return;
    }
    this.errorMessage = '';
    this.notice = '';
    this.submitting = true;
    this.feedbackService.saveFeedback({
      body: {
        bookId: this.bookId,
        note: this.rating,
        comment: this.comment.trim(),
      },
    }).subscribe({
      next: () => {
        this.rating = 0;
        this.comment = '';
        this.submitting = false;
        this.notice = 'Thanks for sharing your thoughts.';
        this.feedbackPage = 0;
        this.changeDetector.markForCheck();
        this.loadFeedback();
        this.loadBook();
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error?.error?.errorMsg || 'Your review could not be saved. You may not be able to review this book.';
        this.changeDetector.markForCheck();
      },
    });
  }

  trackFeedback(index: number, feedback: FeedbackResponse): string {
    return `${feedback.ownFeedback ? 'mine' : 'review'}-${index}`;
  }

  private loadBook(): void {
    if (this.bookId == null) {
      return;
    }
    this.loading = true;
    this.bookService.findBookById({ 'book-id': this.bookId }).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Book details could not be loaded.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadFeedback(): void {
    if (this.bookId == null) {
      return;
    }
    this.feedbackService.findAllFeedbackByBook({
      'book-id': this.bookId,
      page: this.feedbackPage,
      size: this.feedbackSize,
    }).subscribe({
      next: (response) => {
        this.feedbacks = response;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Reviews could not be loaded.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
