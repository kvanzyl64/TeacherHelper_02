import { loginPlatformAdmin } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
          <p className="auth-page__eyebrow">Staff access</p>
          <h2 id="login-form-title">Welcome back</h2>
          <p className="auth-page__form-copy">Use the email and password linked to your account.</p>
          {error ? (
            <p className="auth-page__error" role="alert">
              Email or password is incorrect.
            </p>
          ) : null}
          <form className="auth-page__form" action={loginPlatformAdmin}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <button type="submit">Sign in</button>
          </form>
        </section>
      </div>
    </main>
  );
}
