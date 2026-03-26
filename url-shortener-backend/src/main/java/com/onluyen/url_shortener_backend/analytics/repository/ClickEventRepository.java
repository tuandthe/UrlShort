package com.onluyen.url_shortener_backend.analytics.repository;

import com.onluyen.url_shortener_backend.analytics.entity.ClickEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {
    interface SystemClicksTrendProjection {
        LocalDateTime getPeriodStart();

        Long getClicks();
    }

    List<ClickEvent> findByUrlId(Long urlId);

    long countByUrlId(Long urlId);

    long countByUrlIdAndClickedAtAfter(Long urlId, LocalDateTime since);

    @Query("SELECT DATE(c.clickedAt) as date, COUNT(c) as clicks FROM ClickEvent c WHERE c.url.id = :urlId GROUP BY DATE(c.clickedAt) ORDER BY DATE(c.clickedAt)")
    List<Map<String, Object>> findClicksByDate(Long urlId);

    @Query("SELECT c.referer as referer, COUNT(c) as count FROM ClickEvent c WHERE c.url.id = :urlId AND c.referer IS NOT NULL GROUP BY c.referer ORDER BY COUNT(c) DESC LIMIT 10")
    List<Map<String, Object>> findTopReferers(Long urlId);

    @Query(value = """
            SELECT date_trunc('week', c.clicked_at) AS periodStart, COUNT(*) AS clicks
            FROM click_events c
            GROUP BY 1
            ORDER BY 1
            """, nativeQuery = true)
    List<SystemClicksTrendProjection> findSystemClicksByWeek();

    @Query(value = """
            SELECT date_trunc('month', c.clicked_at) AS periodStart, COUNT(*) AS clicks
            FROM click_events c
            GROUP BY 1
            ORDER BY 1
            """, nativeQuery = true)
    List<SystemClicksTrendProjection> findSystemClicksByMonth();
}
