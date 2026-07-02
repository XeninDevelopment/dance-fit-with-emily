import "server-only";
import { Resend } from "resend";
import type { Booking, Class } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatUkTime } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import { mapsDirectionsUrl } from "@/lib/maps";
import { classIcs } from "@/lib/ics";
import { classUrl, SITE_NAME, CONTACT } from "@/lib/config";

// Sender identity. The domain is verified in Resend; the from-address just needs to be on it.
// Emily's outlook address can't be DKIM-signed, so it's the reply-to instead.
const FROM = process.env.EMAIL_FROM || `${SITE_NAME} <hello@dancefitwithemily.org>`;
const REPLY_TO = process.env.EMAIL_REPLY_TO || CONTACT.email;

/** True once a real Resend API key is configured — mirrors stripeConfigured. */
export const emailConfigured =
  !!process.env.RESEND_API_KEY &&
  process.env.RESEND_API_KEY.startsWith("re_") &&
  !process.env.RESEND_API_KEY.includes("replace_me");

let resendClient: Resend | undefined;
function resend(): Resend {
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

// Table-based, inline-styled HTML (email clients don't do modern CSS). Kept deliberately
// simple: gradient brand band, confirmation, details card, tips, CTA, footer.
function confirmationHtml(booking: Booking, cls: Class): string {
  const firstName = esc(firstNameOf(booking.customerName));
  const when = esc(formatDateTime(cls.classDateTime));
  const name = esc(cls.danceType);
  const url = classUrl(cls.token);
  const location = cls.location
    ? `<tr><td style="padding:4px 0;color:#6b6577;vertical-align:top;">Where</td>
         <td style="padding:4px 0;text-align:right;color:#1f1430;font-weight:600;">${esc(cls.location)}</td></tr>
       <tr><td style="padding:4px 0;"></td>
         <td style="padding:4px 0;text-align:right;">
           <a href="${mapsDirectionsUrl(cls.location)}" style="color:#be185d;font-weight:600;">Get directions →</a>
         </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Booking confirmed — ${esc(SITE_NAME)}</title></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your place at ${name} is confirmed — see you on ${when}!&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fce7f3;">
        <tr>
          <td bgcolor="#5666e6" style="background:linear-gradient(120deg,#5666e6 0%,#ec4d9a 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${esc(SITE_NAME)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#047857;">You’re booked in! 🎉</p>
            <p style="margin:0 0 20px;color:#6b6577;line-height:1.6;">
              Hi ${firstName} — your place at <strong style="color:#1f1430;">${name}</strong> is confirmed.
              We can’t wait to dance with you!
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:12px;padding:8px;">
              <tr><td style="padding:12px 16px 4px;" colspan="2">
                <p style="margin:0;font-size:16px;font-weight:700;color:#be185d;">${name}</p>
              </td></tr>
              <tr><td style="padding:0 16px 12px;" colspan="2">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                  <tr><td style="padding:4px 0;color:#6b6577;">When</td>
                      <td style="padding:4px 0;text-align:right;color:#1f1430;font-weight:600;">${when}</td></tr>
                  ${location}
                  <tr><td style="padding:4px 0;color:#6b6577;">Price</td>
                      <td style="padding:4px 0;text-align:right;color:#1f1430;font-weight:600;">${esc(formatMoney(cls.amount, cls.currency))}</td></tr>
                </table>
              </td></tr>
            </table>

            ${
              cls.spotifyUrl
                ? `<p style="margin:16px 0 0;font-size:14px;color:#6b6577;">Get in the mood — <a href="${esc(cls.spotifyUrl)}" style="color:#be185d;font-weight:600;">listen to tonight’s playlist</a> 🎵</p>`
                : ""
            }

            <p style="margin:20px 0 8px;font-weight:700;color:#1f1430;">Before you arrive</p>
            <ul style="margin:0 0 24px;padding-left:20px;color:#6b6577;line-height:1.8;font-size:14px;">
              <li>Pop it in your calendar — the invite is attached.</li>
              <li>Arrive 5 minutes early in comfy clothes you can move in.</li>
              <li>Bring water — you’ll need it!</li>
            </ul>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
              <a href="${url}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 32px;border-radius:12px;font-size:15px;">View class details</a>
            </td></tr></table>

            <p style="margin:24px 0 0;color:#9b93a8;font-size:12px;line-height:1.6;">
              Your payment receipt is sent separately by Stripe. Questions or can’t make it?
              Just reply to this email.
            </p>

            <p style="margin:20px 0 0;font-size:15px;font-weight:600;color:#1f1430;">
              See you on the dance floor! <span style="color:#be185d;">— Emily x</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #fce7f3;text-align:center;">
            <p style="margin:0;color:#9b93a8;font-size:12px;">${esc(SITE_NAME)} · <a href="mailto:${CONTACT.email}" style="color:#be185d;">${CONTACT.email}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendBookingConfirmation(booking: Booking, cls: Class): Promise<void> {
  const ics = classIcs({
    token: cls.token,
    danceType: cls.danceType,
    classDateTime: cls.classDateTime,
    location: cls.location,
    now: new Date(),
  });

  // Plain-text alternative: better spam score + accessible in text-only clients.
  const text = [
    `Hi ${firstNameOf(booking.customerName)} — you’re booked in!`,
    "",
    cls.danceType,
    `When: ${formatDateTime(cls.classDateTime)}`,
    ...(cls.location ? [`Where: ${cls.location}`, `Directions: ${mapsDirectionsUrl(cls.location)}`] : []),
    `Price: ${formatMoney(cls.amount, cls.currency)}`,
    ...(cls.spotifyUrl ? ["", `Get in the mood — tonight’s playlist: ${cls.spotifyUrl}`] : []),
    "",
    `Class details: ${classUrl(cls.token)}`,
    "",
    "Arrive 5 minutes early in comfy clothes you can move in, and bring water!",
    "Your payment receipt is sent separately by Stripe. Questions or can’t make it? Just reply to this email.",
    "",
    "See you on the dance floor! — Emily x",
  ].join("\n");

  const { error } = await resend().emails.send(
    {
      from: FROM,
      to: booking.customerEmail,
      replyTo: REPLY_TO,
      subject: `You’re booked in — ${cls.danceType}, ${formatDateTime(cls.classDateTime)}`,
      html: confirmationHtml(booking, cls),
      text,
      attachments: [
        {
          filename: `class-${cls.token}.ics`,
          content: Buffer.from(ics).toString("base64"),
          contentType: "text/calendar; charset=utf-8",
        },
      ],
    },
    // Resend dedupes retries of the same key (~24h), so a "sent but response lost" failure
    // that releases our claim can't produce a duplicate email on the retry.
    { idempotencyKey: `booking-confirmation/${booking.id}` },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Waitlist offer email. Tier 1 = exclusive first-access for the person at the front of the
 * queue; tier 2 = first-come for the whole waitlist. Throws on failure — callers (waitlist
 * lib / cron) catch, so a mail outage never breaks the flow that freed the spot.
 */
export async function sendWaitlistOfferEmail(opts: {
  to: { name: string; email: string };
  cls: Class;
  link: string;
  deadline: Date;
  tier: 1 | 2;
  offerId: string;
}): Promise<void> {
  if (!emailConfigured) return;
  const { to, cls, link, deadline, tier, offerId } = opts;
  const firstName = esc(firstNameOf(to.name));
  const name = esc(cls.danceType);
  const when = esc(formatDateTime(cls.classDateTime));
  const until = esc(formatUkTime(deadline));
  const headline = tier === 1 ? "A spot just opened — it’s yours first! 💃" : "A spot is up for grabs!";
  const lead =
    tier === 1
      ? `a place in <strong style="color:#1f1430;">${name}</strong> just opened up, and as first in line it’s reserved just for you until <strong style="color:#1f1430;">${until}</strong>.`
      : `a place in <strong style="color:#1f1430;">${name}</strong> is free and it’s first-come, first-served for everyone on the waitlist until <strong style="color:#1f1430;">${until}</strong> — be quick!`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${headline}</title></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">A spot in ${name} (${when}) can be yours — claim it before ${until}.&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fce7f3;">
        <tr>
          <td bgcolor="#5666e6" style="background:linear-gradient(120deg,#5666e6 0%,#ec4d9a 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${esc(SITE_NAME)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#be185d;">${headline}</p>
            <p style="margin:0 0 20px;color:#6b6577;line-height:1.6;">Hi ${firstName} — ${lead}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:12px;">
              <tr><td style="padding:12px 16px;">
                <p style="margin:0;font-size:16px;font-weight:700;color:#be185d;">${name}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#1f1430;font-weight:600;">${when}${cls.location ? ` · ${esc(cls.location)}` : ""}</p>
              </td></tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding-top:24px;">
              <a href="${link}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 32px;border-radius:12px;font-size:15px;">Claim my spot</a>
            </td></tr></table>
            <p style="margin:24px 0 0;color:#9b93a8;font-size:12px;line-height:1.6;">
              ${tier === 1 ? `If you don’t book by ${until}, the spot opens to the rest of the waitlist.` : `The spot goes to whoever books first — after ${until} it opens to everyone.`}
              No longer interested? Just ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #fce7f3;text-align:center;">
            <p style="margin:0;color:#9b93a8;font-size:12px;">${esc(SITE_NAME)} · <a href="mailto:${CONTACT.email}" style="color:#be185d;">${CONTACT.email}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Hi ${firstNameOf(to.name)} — a spot opened up in ${cls.danceType} (${formatDateTime(cls.classDateTime)}).`,
    tier === 1
      ? `It's reserved just for you until ${formatUkTime(deadline)}.`
      : `First-come, first-served for the waitlist until ${formatUkTime(deadline)}.`,
    "",
    `Claim it: ${link}`,
    "",
    "No longer interested? Just ignore this email.",
  ].join("\n");

  const { error } = await resend().emails.send(
    {
      from: FROM,
      to: to.email,
      replyTo: REPLY_TO,
      subject:
        tier === 1
          ? `Your spot in ${cls.danceType} is waiting — claim by ${formatUkTime(deadline)}`
          : `A spot opened in ${cls.danceType} — first come, first served`,
      html,
      text,
    },
    { idempotencyKey: `waitlist-offer/${offerId}/t${tier}/${to.email}` },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Send the branded confirmation for a PAID booking, exactly once. Safe to call from every
 * PAID observation (webhook, status-page reconcile, read-sync): an atomic claim on
 * confirmationEmailSentAt means only one caller sends; a failed send releases the claim so a
 * later observation retries. Never throws — a mail outage must never 500 the Stripe webhook.
 */
export async function sendConfirmationOnce(booking: Booking): Promise<void> {
  if (!emailConfigured) return;
  if (booking.status !== "PAID" || !booking.customerEmail) return;

  // The claim re-checks the LIVE row status, so a booking refunded/cancelled after our
  // caller read it can never be claimed and emailed "you're booked in".
  const claim = await prisma.booking
    .updateMany({
      where: { id: booking.id, status: "PAID", confirmationEmailSentAt: null },
      data: { confirmationEmailSentAt: new Date() },
    })
    .catch((e) => {
      console.error(`[email] claim failed for booking ${booking.id}:`, e);
      return null;
    });
  if (!claim || claim.count === 0) return; // already sent (or claimed by a racing caller)

  try {
    const cls = await prisma.class.findUnique({ where: { id: booking.classId } });
    if (!cls) return;
    await sendBookingConfirmation(booking, cls);
  } catch (e) {
    console.error(`[email] confirmation failed for booking ${booking.id}:`, e);
    // Release the claim so the next PAID observation can retry.
    await prisma.booking
      .update({ where: { id: booking.id }, data: { confirmationEmailSentAt: null } })
      .catch((e) =>
        console.error(
          `[email] claim release failed for booking ${booking.id} — confirmation may be stuck as sent:`,
          e,
        ),
      );
  }
}
