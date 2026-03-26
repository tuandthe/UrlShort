-- V5__add_url_media_fields.sql
ALTER TABLE urls
    ADD COLUMN qr_code_url VARCHAR(512) NULL,
    ADD COLUMN og_image_url VARCHAR(512) NULL;
