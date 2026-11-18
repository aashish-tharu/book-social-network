package com.example.book.book;

import com.example.book.common.PageResponse;
import com.example.book.exception.OperationNotPermittedException;
import com.example.book.file.FileStorageService;
import com.example.book.history.BookTransaction;
import com.example.book.history.BookTransactionRepository;
import com.example.book.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepoistory bookRepoistory;
    private final BookMapper bookMapper;
    private final BookTransactionRepository bookTransactionRepository;
    private final FileStorageService fileStorageService;

    public Integer save(BookRequest request, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        Book book;
        if (request.id() == null) {
            book = bookMapper.toBook(request);
            book.setOwner(user);
        } else {
            book = bookRepoistory.findById(request.id())
                    .orElseThrow(() -> new EntityNotFoundException("No book found with ID :: " + request.id()));
            if (!Objects.equals(book.getOwner().getId(), user.getId())) {
                throw new OperationNotPermittedException("You cannot update a book you do not own");
            }
            book.setTitle(request.title());
            book.setAuthorName(request.authorName());
            book.setIsbn(request.isbn());
            book.setSynopsis(request.synopsis());
            book.setShareable(request.shareable());
        }
        return bookRepoistory.save(book).getId();
    }

    public BookResponse findById(Integer bookId) {
        return bookRepoistory.findById(bookId)
                .map(bookMapper::toBookResponse)
                .orElseThrow(()-> new EntityNotFoundException("No book found with ID :: " + bookId));
    }

    public PageResponse<BookResponse> findAllBooks(int page, int size, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        Pageable pageable = (Pageable) PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<Book> books = bookRepoistory.findAllDisplayableBooks(pageable, user.getId());
        List<BookResponse> booksResponse = books.stream()
                .map(bookMapper::toBookResponse)
                .toList();
        return new PageResponse<>(
                booksResponse,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements(),
                books.getTotalPages(),
                books.isFirst(),
                books.isLast()
        );
    }

    public Object findAllBooksByOwner(int page, int size, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        Pageable pageable = (Pageable) PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<Book> books = bookRepoistory.findAll(
                BookSpecification.withOwnerId(user.getId()),
                (org.springframework.data.domain.Pageable) pageable);
        List<BookResponse> booksResponse = books.stream()
                .map(bookMapper::toBookResponse)
                .toList();
        return new PageResponse<>(
                booksResponse,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements(),
                books.getTotalPages(),
                books.isFirst(),
                books.isLast()
        );
    }

    public PageResponse<BorrowedBookResponse> findAllBorrowedBooks(int page, int size, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        Pageable pageable = (Pageable) PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<BookTransaction> allBorrowedBooks = bookTransactionRepository.findAllBorrowedBooks(pageable, user.getId());
        List<BorrowedBookResponse> bookResponse = allBorrowedBooks.stream()
                .map(bookMapper::toBorrowedBookResponse)
                .toList();
        return new PageResponse<>(
                bookResponse,
                allBorrowedBooks.getNumber(),
                allBorrowedBooks.getSize(),
                allBorrowedBooks.getTotalElements(),
                allBorrowedBooks.getTotalPages(),
                allBorrowedBooks.isFirst(),
                allBorrowedBooks.isLast()
        );
    }

    public PageResponse<BorrowRequestResponse> findAllPendingBorrowRequests(
            int page,
            int size,
            Authentication connectedUser
    ) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<BookTransaction> requests =
                bookTransactionRepository.findAllPendingBorrowRequests(pageable, user.getId());
        List<BorrowRequestResponse> content = requests.stream()
                .map(bookMapper::toBorrowRequestResponse)
                .toList();
        return new PageResponse<>(
                content,
                requests.getNumber(),
                requests.getSize(),
                requests.getTotalElements(),
                requests.getTotalPages(),
                requests.isFirst(),
                requests.isLast()
        );
    }

    public PageResponse<BorrowedBookResponse> findAllReturnedBooks(int page, int size, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        Pageable pageable = (Pageable) PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<BookTransaction> allBorrowedBooks = bookTransactionRepository.findAllReturnedBooks(pageable, user.getId());
        List<BorrowedBookResponse> bookResponse = allBorrowedBooks.stream()
                .map(bookMapper::toBorrowedBookResponse)
                .toList();
        return new PageResponse<>(
                bookResponse,
                allBorrowedBooks.getNumber(),
                allBorrowedBooks.getSize(),
                allBorrowedBooks.getTotalElements(),
                allBorrowedBooks.getTotalPages(),
                allBorrowedBooks.isFirst(),
                allBorrowedBooks.isLast()
        );
    }

    public Integer updateShareableStatus(Integer bookId, Authentication connectedUser) {
        Book book = bookRepoistory.findById(bookId)
                .orElseThrow(()->new EntityNotFoundException("No book found with the id: " + bookId));
        User user = ((User) connectedUser.getPrincipal());
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannot update books shareable status");
        }
        book.setShareable(!book.isShareable());
        bookRepoistory.save(book);
        return bookId;
    }

    public Integer updateArchivedStatus(Integer bookId, Authentication connectedUser) {
        Book book = bookRepoistory.findById(bookId)
                .orElseThrow(()->new EntityNotFoundException(("No book found with the book id: " + bookId)));
        User user = ((User) connectedUser.getPrincipal());
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannout update books archived status");
        }
        book.setArchived(!book.isArchived());
        bookRepoistory.save(book);
        return bookId;
    }

    public Integer borrowBook(Integer bookId, Authentication connectedUser) {
        Book book = bookRepoistory.findById(bookId)
                .orElseThrow(()->new EntityNotFoundException("No book found with the book id: " + bookId));
        if (book.isArchived() || !book.isShareable()) {
            throw new OperationNotPermittedException("The requested book cannot be borrowed since it is archived or not shareable");
        }

        User user = ((User) connectedUser.getPrincipal());

        if (Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannot borrow your own book");
        }
        final boolean isAlreadBorrowed = bookTransactionRepository.isAlreadBorrowedByUser(bookId, user.getId());
        if (isAlreadBorrowed) {
            throw new OperationNotPermittedException("The requested book is already borrowed");
        }
        BookTransaction bookTransaction = BookTransaction.builder()
                .user(user)
                .book(book)
                .borrowApproved(false)
                .returnApproved(false)
                .returned(false)
                .build();
        return bookTransactionRepository.save(bookTransaction).getId();
    }

    @Transactional
    public Integer approveBorrowRequest(Integer requestId, Authentication connectedUser) {
        User owner = (User) connectedUser.getPrincipal();
        BookTransaction request = bookTransactionRepository
                .findPendingBorrowRequestByIdAndOwnerId(requestId, owner.getId())
                .orElseThrow(() -> new OperationNotPermittedException("No pending request found for this book"));
        Book book = bookRepoistory.findByIdForUpdate(request.getBook().getId())
                .orElseThrow(() -> new EntityNotFoundException("No book found for this request"));
        if (book.isArchived() || !book.isShareable()) {
            throw new OperationNotPermittedException("This book is no longer available to borrow");
        }
        if (bookTransactionRepository.existsByBook_IdAndBorrowApprovedTrueAndReturnApprovedFalse(book.getId())) {
            throw new OperationNotPermittedException("This book already has an approved loan");
        }
        request.setBorrowApproved(true);
        return bookTransactionRepository.save(request).getId();
    }

    @Transactional
    public Integer rejectBorrowRequest(Integer requestId, Authentication connectedUser) {
        User owner = (User) connectedUser.getPrincipal();
        BookTransaction request = bookTransactionRepository
                .findPendingBorrowRequestByIdAndOwnerId(requestId, owner.getId())
                .orElseThrow(() -> new OperationNotPermittedException("No pending request found for this book"));
        request.setBorrowRejected(true);
        return bookTransactionRepository.save(request).getId();
    }


    public Integer returnBorrowedBook(Integer bookId, Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        BookTransaction bookTransaction = bookTransactionRepository.findByBookIdAndUserId(bookId, user.getId())
                .orElseThrow(()->new OperationNotPermittedException("You didn't borrow this book"));
        bookTransaction.setReturned(true);
        return bookTransactionRepository.save(bookTransaction).getId();
    }

    public Integer returnApprovedBorrowedBook(Integer bookId, Authentication connectedUser) {
        Book book = bookRepoistory.findById(bookId)
                .orElseThrow(()-> new EntityNotFoundException("No book found with the book id: " + bookId));
        User user = ((User) connectedUser.getPrincipal());
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannot borrow your own book");
        }
        BookTransaction bookTransaction = bookTransactionRepository.findByBookIdAndOwnerId(bookId, user.getId())
                .orElseThrow(()->new OperationNotPermittedException("The book is not returned yet"));
        bookTransaction.setReturnApproved(true);
        return bookTransactionRepository.save(bookTransaction).getId();
    }

    public void uploadBookCoverPicture(MultipartFile file, Authentication connectedUser, Integer bookId) {
        Book book = bookRepoistory.findById(bookId)
                .orElseThrow(()-> new EntityNotFoundException("No book found with the book id: " + bookId));
        User user = ((User) connectedUser.getPrincipal());
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannot update the cover of a book you do not own");
        }
        var bookCover = fileStorageService.saveFile(file, user.getId());
        book.setBookCover(bookCover);
        bookRepoistory.save(book);
    }
}
