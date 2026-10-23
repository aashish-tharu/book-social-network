package com.example.book.book;

import com.example.book.file.FileUtils;
import com.example.book.history.BookTransaction;
import org.springframework.stereotype.Service;

@Service
public class BookMapper {

    public Book toBook(BookRequest request) {
        return Book.builder()
                .id(request.id())
                .title(request.title())
                .authorName(request.authorName())
                .synopsis(request.synopsis())
                .archived(false)
                .shareable(request.shareable())
                .build();
    }

    public BookResponse toBookResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .authorName(book.getAuthorName())
                .isbn(book.getIsbn())
                .synopsis(book.getSynopsis())
                .rate(book.getRate())
                .archived(book.isArchived())
                .shareable(book.isShareable())
                .owner(book.getOwner().fullName())
                .cover(FileUtils.readFileFromLocation(book.getBookCover()))
                .build();
    }

    public BorrowedBookResponse toBorrowedBookResponse(BookTransaction bookTransaction) {
        return BorrowedBookResponse.builder()
                .id(bookTransaction.getBook().getId())
                .title(bookTransaction.getBook().getTitle())
                .authorName(bookTransaction.getBook().getAuthorName())
                .isbn(bookTransaction.getBook().getIsbn())
                .rate(bookTransaction.getBook().getRate())
                .returned(bookTransaction.isReturned())
                .returnApproved(bookTransaction.isReturnApproved())
                .build();
    }
}
