import { Component, OnInit } from '@angular/core';
import {BookService} from '../../../../services/services/book.service';
import { PageResponseBookResponse } from '../../../../services/models/page-response-book-response';
import {Router} from '@angular/router';

@Component({
  selector: 'app-book-list',
  imports: [],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList implements OnInit{
  page = 0;
  size = 10;
  bookResponse: PageResponseBookResponse = {};

  constructor(
    private bookService: BookService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.findAllBooks();
  }

  private findAllBooks() {
    this.bookService.findAllBooks({
      page: this.page,
      size: this.size
    }).subscribe({
      next: (books) => {
        this.bookResponse = books;
      }
    })
  }
}
