export default function AdminBillingLoading() {
  return (
    <main className="admin-page" aria-busy="true">
      <p className="admin-section__eyebrow">Platform administration / finance</p>
      <h1>Loading billing</h1>
      <p className="admin-section__copy">Retrieving SaaS subscription health and payment status.</p>
    </main>
  );
}
