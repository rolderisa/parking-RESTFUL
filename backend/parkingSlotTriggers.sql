-- Function for Trigger 1: Mark slot as unavailable when booking is approved
CREATE OR REPLACE FUNCTION update_slot_availability_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        UPDATE "ParkingSlot"
        SET "isAvailable" = FALSE
        WHERE id = NEW."slotId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 1: Execute after a booking is updated
CREATE TRIGGER trigger_update_slot_availability_on_approval
AFTER UPDATE ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION update_slot_availability_on_approval();

-- Function for Trigger 2: Mark slot as available when booking is completed or duration ends
CREATE OR REPLACE FUNCTION update_slot_availability_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    active_bookings INTEGER;
BEGIN
    -- Check if status changed to COMPLETED or if endTime is past and status is APPROVED
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED'
       OR (NEW.status = 'APPROVED' AND NEW."endTime" < NOW()) THEN
        -- Check for other active bookings for this slot
        SELECT COUNT(*)
        INTO active_bookings
        FROM "Booking"
        WHERE "slotId" = NEW."slotId"
          AND status IN ('APPROVED', 'PENDING')
          AND id != NEW.id
          AND "endTime" > NOW();

        -- Only mark the slot as available if there are no other active bookings
        IF active_bookings = 0 THEN
            UPDATE "ParkingSlot"
            SET "isAvailable" = TRUE
            WHERE id = NEW."slotId";
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 2: Execute after a booking is updated
CREATE TRIGGER trigger_update_slot_availability_on_completion
AFTER UPDATE ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION update_slot_availability_on_completion();

-- Create a scheduled job to mark expired bookings as COMPLETED
SELECT cron.schedule(
    'mark_expired_bookings',
    '15 minutes',
    $$
    UPDATE "Booking"
    SET status = 'COMPLETED'
    WHERE status = 'APPROVED'
      AND "endTime" < NOW()
      AND "endTime" IS NOT NULL;
    $$
);