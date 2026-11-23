CREATE TABLE "checkins" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id" UUID NOT NULL,
  "ticket_code" VARCHAR(64) NOT NULL,
  "event_id" UUID NOT NULL,
  "door_staff_id" UUID NOT NULL,
  "checked_in_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "checkins_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "checkins_ticket_id_key" UNIQUE ("ticket_id")
);

CREATE INDEX "checkins_event_id_checked_in_at_idx" ON "checkins"("event_id", "checked_in_at");
CREATE INDEX "checkins_door_staff_id_idx" ON "checkins"("door_staff_id");
