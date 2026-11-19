import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookResponse } from '../../../../services/models/book-response';

@Component({
  selector: 'app-book-card',
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss',
})
export class BookCard {
  private _book: BookResponse = {};
  private _manage = false;

  get book(): BookResponse {
    return this._book;
  }

  @Input()
  set book(value: BookResponse) {
    this._book = value;
  }

  get manage(): boolean {
    return this._manage;
  }

  @Input()
  set manage(value: boolean) {
    this._manage = value;
  }

  @Output() borrow = new EventEmitter<BookResponse>();
  @Output() details = new EventEmitter<BookResponse>();
  @Output() edit = new EventEmitter<BookResponse>();
  @Output() share = new EventEmitter<BookResponse>();
  @Output() archive = new EventEmitter<BookResponse>();

  get bookCover(): string {
    const cover = this.book.cover;
    if (!cover || (Array.isArray(cover) && cover.length === 0)) {
      return 'assets/book-cover-placeholder.svg';
    }

    const base64Cover = Array.isArray(cover) ? cover.join('') : String(cover);
    return base64Cover.startsWith('data:image')
      ? base64Cover
      : `data:image/jpeg;base64,${base64Cover}`;
  }

  get filledStars(): number[] {
    const rate = Math.max(0, Math.min(5, Math.round(this.book.rate ?? 0)));
    return Array.from({ length: rate }, (_, index) => index);
  }

  get emptyStars(): number[] {
    return Array.from({ length: 5 - this.filledStars.length }, (_, index) => index);
  }

  onBorrow(): void {
    this.borrow.emit(this.book);
  }

  onDetails(): void {
    this.details.emit(this.book);
  }

  onEdit(): void {
    this.edit.emit(this.book);
  }

  onShare(): void {
    this.share.emit(this.book);
  }

  onArchive(): void {
    this.archive.emit(this.book);
  }
}
