package com.onluyen.url_shortener_backend.url.strategy;

public interface ShortCodeGenerator {
    String generate();
    String getType();
}
