package com.onluyen.url_shortener_backend.url.repository;

import com.onluyen.url_shortener_backend.url.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long>, JpaSpecificationExecutor<Url> {
    Optional<Url> findByShortCode(String shortCode);

    List<Url> findByShortCodeIn(List<String> shortCodes);

    @Query("SELECT u FROM Url u WHERE u.user.id = :userId AND u.isActive = true")
    Page<Url> findByUserIdIsActive(Long userId, Pageable pageable);

    boolean existsByShortCode(String shortCode);

    @Modifying
    @Query("UPDATE Url u SET u.clickCount = u.clickCount + :count WHERE u.shortCode = :shortCode")
    void incrementClickCount(String shortCode, Long count);

    @Query("SELECT COALESCE(SUM(u.clickCount), 0) FROM Url u")
    Long sumClickCount();

    List<Url> findByExpiresAtBeforeAndExpirationNotifiedAtIsNullAndIsActiveTrue(LocalDateTime now);

    List<Url> findByUserIdAndIsActiveTrue(Long userId);
}
