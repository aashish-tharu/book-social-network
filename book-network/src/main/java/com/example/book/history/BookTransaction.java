package com.example.book.history;

import com.example.book.book.Book;
import com.example.book.common.BaseEntity;
import com.example.book.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class BookTransaction extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private boolean returned;
    private boolean returnApproved;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean borrowApproved = true;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean borrowRejected = false;


}
