package com.example.book.book;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepoistory extends JpaRepository<Book, Integer> {
}
