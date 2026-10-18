package com.example.book.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthenticationRequest {
    @Email(message = "Email is not formatted")
    @NotEmpty(message = "Email is manditory")
    @NotBlank(message = "Email is manditory")
    private String email;
    @NotEmpty(message = "Password is manditory")
    @NotBlank(message = "Password is manditory")
    @Size(min=8, message = "Password must be 8 characters long minimun")
    private String password;


}
