package com.example.book.book;

import com.example.book.exception.OperationNotPermittedException;
import com.example.book.file.FileStorageService;
import com.example.book.history.BookTransaction;
import com.example.book.history.BookTransactionRepository;
import com.example.book.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceBorrowRequestTest {

    @Mock
    private BookRepoistory bookRepository;
    @Mock
    private BookTransactionRepository transactionRepository;
    private BookService bookService;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository, new BookMapper(), transactionRepository, new FileStorageService());
    }

    @Test
    void borrowBookCreatesPendingRequest() {
        User borrower = user(2);
        Book book = book(10, user(1));
        Authentication authentication = authentication(borrower);
        when(bookRepository.findById(10)).thenReturn(Optional.of(book));
        when(transactionRepository.isAlreadBorrowedByUser(10, 2)).thenReturn(false);
        when(transactionRepository.save(any(BookTransaction.class))).thenAnswer(invocation -> {
            BookTransaction transaction = invocation.getArgument(0);
            transaction.setId(20);
            return transaction;
        });

        assertEquals(20, bookService.borrowBook(10, authentication));

        ArgumentCaptor<BookTransaction> transaction = ArgumentCaptor.forClass(BookTransaction.class);
        verify(transactionRepository).save(transaction.capture());
        assertFalse(transaction.getValue().isBorrowApproved());
        assertFalse(transaction.getValue().isBorrowRejected());
    }

    @Test
    void ownerCanApprovePendingRequest() {
        User owner = user(1);
        BookTransaction request = BookTransaction.builder()
                .id(20)
                .book(book(10, owner))
                .borrowApproved(false)
                .build();
        Authentication authentication = authentication(owner);
        when(transactionRepository.findPendingBorrowRequestByIdAndOwnerId(20, 1))
                .thenReturn(Optional.of(request));
        when(bookRepository.findByIdForUpdate(10)).thenReturn(Optional.of(request.getBook()));
        when(transactionRepository.existsByBook_IdAndBorrowApprovedTrueAndReturnApprovedFalse(10))
                .thenReturn(false);
        when(transactionRepository.save(request)).thenReturn(request);

        assertEquals(20, bookService.approveBorrowRequest(20, authentication));
        assertTrue(request.isBorrowApproved());
        verify(transactionRepository).save(request);
    }

    @Test
    void ownerCanDeclinePendingRequest() {
        User owner = user(1);
        BookTransaction request = BookTransaction.builder()
                .id(20)
                .book(book(10, owner))
                .borrowApproved(false)
                .build();
        Authentication authentication = authentication(owner);
        when(transactionRepository.findPendingBorrowRequestByIdAndOwnerId(20, 1))
                .thenReturn(Optional.of(request));
        when(transactionRepository.save(request)).thenReturn(request);

        assertEquals(20, bookService.rejectBorrowRequest(20, authentication));
        assertTrue(request.isBorrowRejected());
        verify(transactionRepository).save(request);
    }

    @Test
    void anotherUserCannotApproveRequest() {
        Authentication authentication = authentication(user(3));
        when(transactionRepository.findPendingBorrowRequestByIdAndOwnerId(20, 3))
                .thenReturn(Optional.empty());

        assertThrows(
                OperationNotPermittedException.class,
                () -> bookService.approveBorrowRequest(20, authentication)
        );
    }

    private static Book book(Integer id, User owner) {
        return Book.builder()
                .id(id)
                .owner(owner)
                .archived(false)
                .shareable(true)
                .build();
    }

    private static User user(Integer id) {
        return User.builder().id(id).build();
    }

    private static Authentication authentication(User user) {
        return new UsernamePasswordAuthenticationToken(user, null, List.of());
    }
}
