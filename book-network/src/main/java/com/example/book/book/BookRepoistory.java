package com.example.book.book;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BookRepoistory extends JpaRepository<Book, Integer>, JpaSpecificationExecutor<Book> {

    @Query("""
   SELECT book
   FROM Book book
   WHERE book.archived = false
   AND book.shareable = true
   AND book.owner.id != :userId
    """)
    Page<Book> findAllDisplayableBooks(Pageable pageable, @Param("userId") Integer userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select book from Book book where book.id = :bookId")
    Optional<Book> findByIdForUpdate(@Param("bookId") Integer bookId);
}
