CREATE TABLE IF NOT EXISTS "tzofim_anchors" (
  "id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "text" text NOT NULL,
  "category" text NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" text NOT NULL DEFAULT (NOW()::text)
);

CREATE INDEX IF NOT EXISTS "tzofim_anchors_display_order_idx"
  ON "tzofim_anchors" ("display_order", "created_at");
