package com.example.book.history;

import com.example.book.book.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookTransactionRepository extends JpaRepository<BookTransaction, Integer> {

    @Query("""
    select history
    from BookTransaction history
    where history.user.id = :userId
""")
    Page<BookTransaction> findAllBorrowedBooks(Pageable pageable, @Param("userId") Integer userId);

    @Query("""
    select  history
    from BookTransaction  history
    where history.book.owner.id = :userId
""")
    Page<BookTransaction> findAllReturnedBooks(Pageable pageable, @Param("userId") Integer userId);

    @Query("""
    select
    (COUNT(*) > 0) as isBorrowed
    from BookTransaction bookTransaction
    where bookTransaction.user.id = :userId
    and bookTransaction.book.id = :bookId
    and bookTransaction.returnApproved = false
    """)
    boolean isAlreadBorrowedByUser(@Param("bookId") Integer bookId, @Param("userId") Integer userId);

    @Query("""
    select transaction
    from BookTransaction  transaction
    where transaction.user.id = :userId
    and transaction.book.id = :bookId
    and transaction.returned = false
    and transaction.returnApproved = false
""")
    Optional<BookTransaction> findByBookIdAndUserId(@Param("bookId") Integer bookId, @Param("userId") Integer userId);

    @Query("""
    select transaction
    from BookTransaction  transaction
    where transaction.book.owner.id = :userId
    and transaction.book.id = :bookId
    and transaction.returned = true
    and transaction.returnApproved = false
""")
    Optional<BookTransaction> findByBookIdAndOwnerId(@Param("bookId") Integer bookId, @Param("userId") Integer userId);
}
