# Guardian Access-Link Contract

## Purpose

Define the passwordless, single-record access boundary used by WhatsApp messages for approved
sessions, resources, invoices, and receipts.

## Create Link

**Caller**: An authorised centre workflow after approval or invoice issue.

**Input**:

- `centre_id`
- `guardian_id`
- `student_id`
- `record_type`: `session`, `resource`, `invoice`, or `receipt`
- `record_id`
- `visibility_context`

**Rules**:

- Guardian relationship, relationship confirmation, WhatsApp-number confirmation, consent, and
  record visibility MUST pass before creation.
- The link MUST expire exactly seven days after the associated message is sent.
- The token MUST be opaque and stored server-side as a digest; protected content MUST NOT be encoded
  in the URL.
- Creating a replacement link MUST revoke the prior active link when policy requires it.
- Creation MUST emit an audit event and return a reference suitable for the notification adapter.

## Open Link

**Input**: Opaque token from the message URL.

**Success**:

- Re-evaluate token status, expiry, centre scope, guardian relationship, consent, and record
  visibility at request time.
- Render only the linked record and permitted fields in a phone-first page.
- Return no navigation or query capability that discovers unrelated student, family, invoice, or
  session records.
- Record an access-open audit event without recording the token or protected content.

**Failure**:

- Expired, revoked, invalid, or unauthorized tokens return a generic unavailable response that does
  not reveal whether the record exists.
- The centre receives an actionable status through the operational dashboard.
- The guardian is not offered an alternate delivery channel in MVP.

## Revoke and Resend

- Centre owner/admin can revoke a link when a relationship, consent, record, or delivery condition
  changes.
- A resend creates a fresh seven-day link and records the prior link and reason in the audit trail.
- Revocation takes effect before the next open attempt.

## Acceptance Examples

1. A valid link for an approved session shows only that session's configured guardian-visible fields.
2. A link for an unapproved session returns the generic unavailable response.
3. A link opened after seven days returns the generic unavailable response.
4. A link from Centre A cannot open a record from Centre B.
5. A forwarded link cannot discover other records and becomes unusable after revocation.
