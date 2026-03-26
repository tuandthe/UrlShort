package com.onluyen.url_shortener_backend.user.dto;

import com.onluyen.url_shortener_backend.common.constant.ValidationConstant;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = ValidationConstant.MAX_FULL_NAME_LENGTH, message = "Tên không được vượt quá 100 ký tự")
    private String fullName;

    @Size(min = ValidationConstant.MIN_PASSWORD_LENGTH, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String newPassword;
}
