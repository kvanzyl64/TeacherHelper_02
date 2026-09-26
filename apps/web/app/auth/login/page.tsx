import { beginOidcSignIn } from "./actions";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <header className="auth-page__topbar">
        <a className="auth-page__brand" href="/">
          <span className="auth-page__brand-mark" aria-hidden="true">
            TH
          </span>
          <span>Teacher Helper</span>
        </a>
        <a className="auth-page__home" href="/">
          Back to home
        </a>
      </header>
      <div className="auth-page__body">
        <section className="auth-page__intro" aria-labelledby="login-title">
          <p className="auth-page__eyebrow">Your centre, in sync</p>
          <h1 id="login-title">Sign in to Teacher Helper.</h1>
          <p>Return to the people, sessions, and practical work that keep learning moving.</p>
          <div className="auth-page__promise">
            <span aria-hidden="true" />
            <p>Private by design. Your centre stays yours.</p>
          </div>
        </section>
        <section className="auth-page__form-section" aria-labelledby="login-form-title">
          <p className="auth-page__eyebrow">Managed staff access</p>
          <h2 id="login-form-title">Welcome back</h2>
          <p className="auth-page__form-copy">Continue with your organization&apos;s secure sign-in provider.</p>
          <form className="auth-page__form" action={beginOidcSignIn}>
            <button type="submit">Continue to secure sign-in</button>
          </form>
        </section>
      </div>
    </main>
  );
}
