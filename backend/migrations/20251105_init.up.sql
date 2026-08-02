CREATE TYPE "gender" AS ENUM (
	'man',
	'woman',
	'non_binary',
	'other'
);

CREATE TYPE "sex" AS ENUM (
	'male',
	'female',
	'intersex'
);

CREATE TYPE "notification_type" AS ENUM (
	'message',
	'like',
	'profile_view',
	'unlike'
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"lastname" TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"email_validated_at" TIMESTAMP,
	"password" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "users_details" (
	"user_id" INTEGER NOT NULL UNIQUE,
	"gender" GENDER NOT NULL,
	"sex" SEX NOT NULL,
	"preferred_gender" GENDER NOT NULL,
	"preferred_sex" SEX NOT NULL,
	"preferred_min_age" INTEGER NOT NULL,
	"preferred_max_age" INTEGER NOT NULL,
	"lat" DECIMAL NOT NULL,
	"lon" DECIMAL NOT NULL,
	"biography" TEXT NOT NULL,
	"fame_rating" INTEGER NOT NULL,
	"birthday" DATE NOT NULL,
	"last_connection" TIMESTAMP,
	PRIMARY KEY("user_id")
);




CREATE TABLE IF NOT EXISTS "tags" (
	"id" SERIAL NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "users_interests_tags" (
	"id" SERIAL NOT NULL UNIQUE,
	"user_id" BIGINT NOT NULL,
	"tag_id" BIGINT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "users_photos" (
	"user_id" INTEGER NOT NULL UNIQUE,
	"file_path" TEXT NOT NULL,
	PRIMARY KEY("user_id")
);




CREATE TABLE IF NOT EXISTS "profile_visits" (
	"id" SERIAL NOT NULL UNIQUE,
	"visitor_user_id" BIGINT NOT NULL,
	"visited_user_id" BIGINT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "profile_likes" (
	"id" SERIAL NOT NULL UNIQUE,
	"liker_user_id" BIGINT NOT NULL,
	"liked_user_id" BIGINT NOT NULL,
	"created_at" TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "blocked_users" (
	"id" SERIAL NOT NULL UNIQUE,
	"blocker_user_id" BIGINT NOT NULL,
	"blocked_user_id" BIGINT NOT NULL,
	PRIMARY KEY("id")
);






CREATE TABLE IF NOT EXISTS "messages" (
	"id" SERIAL NOT NULL UNIQUE,
	"sender_user_id" BIGINT NOT NULL,
	"receiver_user_id" BIGINT NOT NULL,
	"message" TEXT NOT NULL,
	"sent_at" TIMESTAMP NOT NULL,
	"viewed_at" TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "notifications" (
	"id" SERIAL NOT NULL UNIQUE,
	"producer_user_id" BIGINT NOT NULL,
	"target_user_id" BIGINT NOT NULL,
	"type" NOTIFICATION_TYPE NOT NULL,
	"viewed_at" TIMESTAMP,
	"created_at" TIMESTAMP NOT NULL,
	PRIMARY KEY("id")
);



ALTER TABLE "users_interests_tags"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "users_interests_tags"
ADD FOREIGN KEY("tag_id") REFERENCES "tags"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "users_photos"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "profile_visits"
ADD FOREIGN KEY("visitor_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "profile_visits"
ADD FOREIGN KEY("visited_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "profile_likes"
ADD FOREIGN KEY("liker_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "profile_likes"
ADD FOREIGN KEY("liked_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "blocked_users"
ADD FOREIGN KEY("blocker_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "blocked_users"
ADD FOREIGN KEY("blocked_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "messages"
ADD FOREIGN KEY("sender_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "messages"
ADD FOREIGN KEY("receiver_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "notifications"
ADD FOREIGN KEY("producer_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "notifications"
ADD FOREIGN KEY("target_user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "users_details"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
