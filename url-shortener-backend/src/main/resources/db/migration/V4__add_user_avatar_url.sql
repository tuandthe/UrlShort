-- V4__add_user_avatar_url.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512) NULL;
