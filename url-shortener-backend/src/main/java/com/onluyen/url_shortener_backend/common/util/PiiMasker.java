package com.onluyen.url_shortener_backend.common.util;

public final class PiiMasker {

    private PiiMasker() {
    }

    public static String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "***@***";
        }

        int atIndex = email.indexOf('@');
        String domain = email.substring(atIndex);
        return "***" + domain;
    }
}