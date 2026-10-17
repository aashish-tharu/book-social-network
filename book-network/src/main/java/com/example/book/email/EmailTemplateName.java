package com.example.book.email;

import lombok.Getter;

@Getter
public enum EmailTemplateName {

    ACTIVATE_ACCCOUNT("activation_account");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }

}
