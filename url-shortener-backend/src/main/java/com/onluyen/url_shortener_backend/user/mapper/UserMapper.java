package com.onluyen.url_shortener_backend.user.mapper;

import com.onluyen.url_shortener_backend.user.dto.UserProfileResponse;
import com.onluyen.url_shortener_backend.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "isActive", source = "active")
    UserProfileResponse toProfileResponse(User user);
}
