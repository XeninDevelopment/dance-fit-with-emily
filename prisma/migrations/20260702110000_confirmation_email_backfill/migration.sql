-- Backfill: bookings paid BEFORE the confirmation-email feature existed must never receive
-- a retroactive "You're booked in" email. Mark them as already sent.
UPDATE "Booking"
SET "confirmationEmailSentAt" = COALESCE("paidAt", "createdAt")
WHERE "status" = 'PAID' AND "confirmationEmailSentAt" IS NULL;
