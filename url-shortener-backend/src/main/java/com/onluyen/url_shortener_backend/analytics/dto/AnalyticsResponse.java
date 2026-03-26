package com.onluyen.url_shortener_backend.analytics.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalyticsResponse {
    private Long totalClicks;
    private List<Map<String, Object>> clicksByDate; // [ { "date": "2024-03-01", "clicks": 5 } ]
    private List<Map<String, Object>> topReferers;  // [ { "referer": "google.com", "count": 10 } ]
}
