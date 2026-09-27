import type { CentreSettingsRepository } from "@teacher-helper/domain";

type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
};

export function createPostgresCentreSettingsRepository(client: QueryClient): CentreSettingsRepository {
  return {
    async save(settings) {
      await client.query(
        `UPDATE app.centres
            SET billing_settings = billing_settings || jsonb_build_object('legalName', $2::text),
                timezone = $3,
                notification_settings = notification_settings || jsonb_build_object('email', $4::text),
                updated_at = now()
          WHERE id = $1`,
        [settings.centreId, settings.legalName, settings.timezone, settings.notificationEmail],
      );
      await client.query(
        `INSERT INTO app.audit_events
          (centre_id, event_type, entity_type, entity_id, request_id, metadata)
         VALUES ($1, 'centre.settings.updated', 'centre', $1, $2, $3)`,
        [settings.centreId, `settings-${settings.centreId}`, JSON.stringify({ fields: ["legalName", "timezone", "notificationEmail"] })],
      );
      return settings;
    },

    async getByCentreId(centreId) {
      const result = await client.query<CentreSettingsRow>(
        `SELECT id AS centre_id,
                COALESCE(billing_settings ->> 'legalName', name) AS legal_name,
                timezone,
                COALESCE(notification_settings ->> 'email', '') AS notification_email
           FROM app.centres WHERE id = $1`,
        [centreId],
      );
      const row = result.rows[0];
      return row
        ? { centreId: row.centre_id, legalName: row.legal_name, timezone: row.timezone, notificationEmail: row.notification_email }
        : null;
    },
  };
}

type CentreSettingsRow = {
  centre_id: string;
  legal_name: string;
  timezone: string;
  notification_email: string;
};