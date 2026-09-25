# WhatsApp Delivery Contract

## Purpose

Define the provider-independent boundary for guardian verification codes, approved session updates,
and issued invoice notifications.

## Send Message

**Input**:

- `notification_id`
- `guardian_id`
- `verified_whatsapp_number`
- `template_key`
- `template_parameters`
- `access_link_reference` when the message contains a protected link
- `idempotency_key`

**Rules**:

- Only verified guardian numbers with active relationships and required consent may receive
  protected content.
- Templates MUST contain no protected student or invoice information beyond approved message text.
- The provider adapter MUST return a provider message identifier or a classified failure.
- Repeated requests with the same idempotency key MUST NOT send duplicate messages.
- Provider credentials and raw secrets MUST never enter application logs or audit metadata.

## Delivery Events

The adapter normalizes provider callbacks into:

- `accepted`
- `delivered`
- `read`
- `failed`
- `unknown`

Each event includes the provider message identifier, event time, normalized failure reason when
available, and a deduplication key. Unknown or duplicate callbacks are retained for investigation
without changing a terminal notification state incorrectly.

## Retry Policy

- Transient failures are retried with bounded backoff.
- Permanent failures move the notification to `failed` and create a centre-visible follow-up event.
- MVP does not automatically switch to SMS or email.
- Retry counts and provider rate limits are configuration values, not caller-controlled input.

## Verification Code Messages

- A code challenge is created only after centre staff confirm the guardian relationship.
- The code is short-lived, single-use, attempt-limited, and stored only as a digest.
- A successful code confirmation marks the WhatsApp number eligible for protected messages but does
  not create a parent account or grant broad record access.
