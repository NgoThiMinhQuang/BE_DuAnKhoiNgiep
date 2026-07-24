ALTER TABLE cau_hinh_cua_hang
  ADD COLUMN bat_facebook TINYINT(1) NOT NULL DEFAULT 1 AFTER facebook_url,
  ADD COLUMN bat_instagram TINYINT(1) NOT NULL DEFAULT 1 AFTER instagram_url,
  ADD COLUMN bat_tiktok TINYINT(1) NOT NULL DEFAULT 1 AFTER tiktok_url,
  ADD COLUMN bat_youtube TINYINT(1) NOT NULL DEFAULT 1 AFTER youtube_url;
