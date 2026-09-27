import { requestPasswordRecovery } from "./actions";

type PasswordRecoveryPageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function PasswordRecoveryPage({ searchParams }: PasswordRecoveryPageProps) {
  const { sent, error } = await searchParams;

  return (
    <main className="auth-page">
      <header className="auth-page__topbar">
        <a className="auth-page__brand" href="/">
          <span className="auth-page__brand-mark" aria-hidden="true">
            TH
          </span>
          <span>Teacher Helper</span>
        </a>
        <a className="auth-page__home" href="/auth/login">
          Back to sign in
        </a>
      </header>
      <div className="auth-page__body">
        <section className="auth-page__intro" aria-labelledby="recovery-title">
          <p className="auth-page__eyebrow">Account access</p>
          <h1 id="recovery-title">Recover access.</h1>
          <p>Request a secure link to choose a new password for your staff account.</p>
          <div className="auth-page__promise">
            <span aria-hidden="true" />
            <p>Recovery links expire after 30 minutes.</p>
          </div>
        </section>
        <section className="auth-page__form-section" aria-labelledby="recovery-form-title">
          <p className="auth-page__eyebrow">Password recovery</p>
          <h2 id="recovery-form-title">Request a link</h2>
          {sent === "1" ? (
            <p className="auth-page__form-copy" role="status" aria-live="polite">
              If an active account matches that email, recovery instructions will be sent.
            </p>
          ) : (
            <>
              <p className="auth-page__form-copy">
                Enter your account email. We’ll show the same confirmation whether or not it matches
                an active account.
              </p>
              {error === "invalid" ? (
                <p className="auth-page__error" role="alert">
                  That recovery link is unavailable. Request a new link below.
                </p>
              ) : null}
              <form className="auth-page__form" action={requestPasswordRecovery}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  required
                />
                <button type="submit">Send recovery link</button>
              </form>
            </>
          )}
          <a className="auth-page__form-recovery" href="/auth/login">
            Return to sign in
          </a>
        </section>
      </div>
    </main>
  );
}
