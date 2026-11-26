package com.example.book.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final SpringTemplateEngine templateEngine;

    @Value("${application.mailing.brevo.api-key}")
    private String brevoApiKey;

    @Value("${application.mailing.brevo.sender-email}")
    private String senderEmail;

    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String confirmationUrl,
            String activationCode,
            String subject
    ) {
        String templateName = (emailTemplate == null) ? "confirm-email" : emailTemplate.name();

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);
        properties.put("activation_code", activationCode);

        Context context = new Context();
        context.setVariables(properties);
        String htmlContent = templateEngine.process(templateName, context);

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of("name", "Book Social Network", "email", senderEmail),
                "to", List.of(Map.of("email", to, "name", username)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        try {
            RestClient.create()
                    .post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Activation email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send activation email to {}: {}", to, e.getMessage());
        }
    }
}