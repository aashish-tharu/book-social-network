import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../services/services/book.service';
import { BorrowRequestResponse } from '../../../../services/models/borrow-request-response';
import { PageResponseBorrowRequestResponse } from '../../../../services/models/page-response-borrow-request-response';
import { Pagination } from '../../components/pagination/pagination';

@Component({
  selector: 'app-borrow-requests',
  imports: [CommonModule, Pagination],
  templateUrl: './borrow-requests.html',
  styleUrl: './borrow-requests.scss',
})
export class BorrowRequests implements OnInit {
  page = 0;
  readonly size = 10;
  requests: PageResponseBorrowRequestResponse = {};
  loading = false;
  errorMessage = '';
  notice = '';
  processingRequestId?: number;

  constructor(
    private readonly bookService: BookService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  changePage(page: number): void {
    this.page = page;
    this.loadRequests();
  }

  approve(request: BorrowRequestResponse): void {
    this.respondToRequest(request, true);
  }

  reject(request: BorrowRequestResponse): void {
    this.respondToRequest(request, false);
  }

  private respondToRequest(request: BorrowRequestResponse, approve: boolean): void {
    if (request.id == null) {
      return;
    }

    this.errorMessage = '';
    this.notice = '';
    this.processingRequestId = request.id;
    const response = approve
      ? this.bookService.approveBorrowRequest({ 'request-id': request.id })
      : this.bookService.rejectBorrowRequest({ 'request-id': request.id });

    response.subscribe({
      next: () => {
        this.processingRequestId = undefined;
        this.notice = approve
          ? 'Borrow request approved.'
          : 'Borrow request declined.';
        this.changeDetector.markForCheck();
        this.loadRequests();
      },
      error: (error) => {
        this.processingRequestId = undefined;
        this.errorMessage = error?.error?.errorMsg
          || `The borrow request could not be ${approve ? 'approved' : 'declined'}. Please try again.`;
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';
    this.bookService.findAllPendingBorrowRequests({ page: this.page, size: this.size }).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Borrow requests could not be loaded. Please try again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
