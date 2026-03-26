package com.onluyen.url_shortener_backend.common.util;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

public class Base62Encoder {

    private static final char[] ALLOWED_CHARACTERS = AppConstant.ALLOWED_STRING.toCharArray();
    private static final int BASE = ALLOWED_CHARACTERS.length;

    public static String encode(long input) {
        StringBuilder encodedString = new StringBuilder();

        if (input == 0) {
            return String.valueOf(ALLOWED_CHARACTERS[0]);
        }

        while (input > 0) {
            encodedString.append(ALLOWED_CHARACTERS[(int) (input % BASE)]);
            input = input / BASE;
        }

        // Padding to minimum characters length
        while (encodedString.length() < AppConstant.SHORT_CODE_MIN_LENGTH) {
            encodedString.append(ALLOWED_CHARACTERS[0]);
        }

        return encodedString.reverse().toString();
    }

    public static long decode(String input) {
        char[] characters = input.toCharArray();
        int length = characters.length;

        long decoded = 0;
        int counter = 1;

        for (int i = 0; i < length; i++) {
            decoded += AppConstant.ALLOWED_STRING.indexOf(characters[i]) * Math.pow(BASE, length - counter);
            counter++;
        }

        return decoded;
    }
}
