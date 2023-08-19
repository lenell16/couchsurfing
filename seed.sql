CREATE TABLE IF NOT EXISTS "friends" (
	"user_id1" integer NOT NULL,
	"user_id2" integer NOT NULL,
	CONSTRAINT friends_user_id1_user_id2 PRIMARY KEY("user_id1","user_id2")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id1_users_id_fk" FOREIGN KEY ("user_id1") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id2_users_id_fk" FOREIGN KEY ("user_id2") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


-- Seed data for users table
INSERT INTO "public"."users" ("name", "email") VALUES
('Alice', 'alice@email.com'),
('Bob', 'bob@email.com'),
('Charlie', 'charlie@email.com'),
('David', 'david@email.com'),
('Eve', 'eve@email.com');

INSERT INTO "public"."friends" ("user_id1", "user_id2") VALUES
(1, 2),
(1, 3);


INSERT INTO "public"."friends" ("user_id1", "user_id2") VALUES
(2, 1),
(2, 4);

INSERT INTO "public"."friends" ("user_id1", "user_id2") VALUES
(3, 1);

INSERT INTO "public"."friends" ("user_id1", "user_id2") VALUES
(4, 2);
