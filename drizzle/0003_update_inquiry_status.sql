ALTER TYPE "public"."inquiry_status" RENAME TO "inquiry_status_old";--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('pending', 'quoted', 'approved', 'in_production', 'qc_packaging', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "status" TYPE "public"."inquiry_status" USING (
	CASE
		WHEN "status"::text = 'shipped' THEN 'completed'
		ELSE "status"::text
	END
)::"public"."inquiry_status";--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
DROP TYPE "public"."inquiry_status_old";
