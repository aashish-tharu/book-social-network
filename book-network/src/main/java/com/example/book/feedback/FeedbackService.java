package com.example.book.feedback;

import com.example.book.book.Book;
import com.example.book.book.BookRepoistory;
import com.example.book.exception.OperationNotPermittedException;
import com.example.book.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final BookRepoistory bookRepoistory;
    private final FeedbackMapper feedbackMapper;
    private final FeedbackRepository feedbackRepository;

    public Integer save(FeedbackRequest request, Authentication connectedUser) {
        Book book = bookRepoistory.findById(request.bookId())
                .orElseThrow(()->new EntityNotFoundException("No book found with the Id: " + request.bookId()));
        if (book.isArchived() || !book.isShareable()) {
            throw new OperationNotPermittedException("You cannot give a feedback for an archived or not shareable book");
        }
        User user = ((User) connectedUser.getPrincipal());
        if (Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You cannot give a feedback to your own book");
        }
        Feedback feeback = feedbackMapper.toFeedback(request);
        return feedbackRepository.save(feeback).getId();
    }
}
