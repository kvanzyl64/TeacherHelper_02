export default function AdminAlertsLoading() {
  return (
    <main className="admin-page" aria-busy="true">
      <p className="admin-section__eyebrow">Platform administration / alerts</p>
      <h1>Loading alerts</h1>
      <p className="admin-section__copy">Retrieving operational escalations and recovery context.</p>
    </main>
  );
}