CREATE TYPE "public"."product_price_type" AS ENUM('fixed', 'starting_from', 'request_quote');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_type" "public"."product_price_type" DEFAULT 'fixed' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "currency" text DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;--> statement-breakpoint
UPDATE "products" SET "price_type" = CASE WHEN "price" IS NULL THEN 'request_quote'::"public"."product_price_type" ELSE 'fixed'::"public"."product_price_type" END WHERE "price_type" IS NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "quoted_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "quoted_currency" text DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "estimated_delivery_days" integer;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "quote_note" text;
