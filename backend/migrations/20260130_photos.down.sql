ALTER TABLE "users_photos"
ADD "file_path" TEXT NOT NULL;

ALTER TABLE "users_photos"
DROP CONSTRAINT users_photos_pkey;

ALTER TABLE "users_photos"
DROP COLUMN "photo_id";

ALTER TABLE "users_photos" ADD PRIMARY KEY ("user_id");

DROP TABLE photos;
