package com.example.book.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BorrowRequestResponse {

    private Integer id;
    private Integer bookId;
    private String title;
    private String authorName;
    private String isbn;
    private String borrowerName;
    private LocalDateTime requestedAt;
}
