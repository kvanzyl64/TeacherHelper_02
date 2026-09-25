# Invoice and Receipt Notification Contract

## Purpose

Define the user-facing contract for issuing a ZAR invoice and notifying an eligible guardian with a
single-record link.

## Issue Invoice

- An authorised centre owner or administrator creates or finalizes an invoice for a student or
  family.
- The invoice records the billing period, line items, ZAR currency, tax treatment, total, due state,
  and document reference.
- Issuing an invoice creates an audit event and freezes the issued financial values except through
  an audited correction or cancellation flow.

## Notify Guardian

- For each eligible verified guardian, create one notification and one access link for the invoice
  or receipt record.
- Send the WhatsApp template through the delivery contract.
- Expose delivery, link-open, expiry, failure, and resend status to authorised centre users.
- Do not include full invoice totals, student details, or payment information in provider previews
  beyond the approved template content.

## Record Payment

- An authorised centre user records method, amount, currency, date, and reference for EFT, cash, or
  other manual payment.
- The invoice state changes to `partially_paid` or `paid` according to the reconciled total; disputed,
  failed, and cancelled states require an explicit reason.
- Payment, receipt, and notification changes emit audit events.
