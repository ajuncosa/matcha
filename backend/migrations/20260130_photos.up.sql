CREATE TABLE IF NOT EXISTS "photos" (
	"id" SERIAL NOT NULL UNIQUE,
	"file_path" TEXT NOT NULL,
	PRIMARY KEY("id")
);

ALTER TABLE "users_photos"
DROP COLUMN "file_path";

ALTER TABLE "users_photos"
DROP CONSTRAINT users_photos_pkey;

ALTER TABLE "users_photos"
ADD "photo_id" BIGINT NOT NULL;

ALTER TABLE "users_photos" ADD PRIMARY KEY ("photo_id");

ALTER TABLE "users_photos"
ADD FOREIGN KEY("photo_id") REFERENCES "photos"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
