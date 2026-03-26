package com.onluyen.url_shortener_backend.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> errors;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long totalItems;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer totalPages;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer currentPage;

    private T data;

    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(int status, String message, T data, int currentPage, int totalPages,
            long totalItems) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .currentPage(currentPage)
                .totalPages(totalPages)
                .totalItems(totalItems)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message, T errors) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(errors)
                .build();
    }
}
