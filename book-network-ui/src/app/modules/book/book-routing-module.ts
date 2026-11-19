import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Main} from './pages/main/main';
import {BookList} from './pages/book-list/book-list';
import {MyBooks} from './pages/my-books/my-books';
import {BookForm} from './pages/book-form/book-form';
import {BorrowedBooks} from './pages/borrowed-books/borrowed-books';
import {ReturnedBooks} from './pages/returned-books/returned-books';
import {BookDetails} from './pages/book-details/book-details';
import {BorrowRequests} from './pages/borrow-requests/borrow-requests';

const routes: Routes = [
  {
    path: '',
    component: Main,
    children: [
      {
        path: '',
        component: BookList
      },
      { path: 'my-books', component: MyBooks },
      { path: 'my-borrowed-books', component: BorrowedBooks },
      { path: 'returned-books', component: ReturnedBooks },
      { path: 'borrow-requests', component: BorrowRequests },
      { path: 'manage/new', component: BookForm },
      { path: 'manage/:bookId', component: BookForm },
      { path: ':bookId', component: BookDetails },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookRoutingModule {}
