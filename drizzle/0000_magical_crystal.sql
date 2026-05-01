CREATE TYPE "public"."inquiry_status" AS ENUM('pending', 'quoted', 'in_production', 'shipped', 'completed');--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('tr', 'en');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'pending',
	"product_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"language_code" "language_code" NOT NULL,
	"name" text NOT NULL,
	"material" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"color" text NOT NULL,
	"color_hex" text NOT NULL,
	"dimensions" jsonb NOT NULL,
	"images" text[] NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_translations_product_lang_uidx" ON "product_translations" USING btree ("product_id","language_code");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");