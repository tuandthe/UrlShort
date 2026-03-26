package com.onluyen.url_shortener_backend.auth.mapper;

import com.onluyen.url_shortener_backend.auth.dto.AuthResponse;
import com.onluyen.url_shortener_backend.auth.dto.AuthResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    AuthResponse toAuthResponse(AuthResult result);
}
