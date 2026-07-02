-- Exactly-once claim flag for the branded booking-confirmation email.
ALTER TABLE "Booking" ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);
