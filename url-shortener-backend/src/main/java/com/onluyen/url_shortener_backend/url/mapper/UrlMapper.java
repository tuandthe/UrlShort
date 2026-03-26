package com.onluyen.url_shortener_backend.url.mapper;

import com.onluyen.url_shortener_backend.url.dto.UrlDetailResponse;
import com.onluyen.url_shortener_backend.url.entity.Url;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface UrlMapper {

    @Mapping(target = "hasPassword", expression = "java(url.getPassword() != null && !url.getPassword().isEmpty())")
    @Mapping(target = "shortUrl", expression = "java(baseUrl + \"/\" + url.getShortCode())")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "status", expression = "java(resolveStatus(url))")
    UrlDetailResponse toDetailResponse(Url url, @Context String baseUrl);

    default String resolveStatus(Url url) {
        if (!url.isActive()) {
            return "INACTIVE";
        }

        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            return "EXPIRED";
        }

        return "ACTIVE";
    }
}
