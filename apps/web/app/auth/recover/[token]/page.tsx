import type { Metadata } from "next";
import { completePasswordRecoveryAction } from "./actions";
import { isPasswordRecoveryTokenValid } from "../../../../lib/auth/recovery";
import { getDatabasePool } from "../../../../lib/database";

export const metadata: Metadata = { referrer: "no-referrer" };

type PasswordRecoveryTokenPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function PasswordRecoveryTokenPage({
  params,
  searchParams,
}: PasswordRecoveryTokenPageProps) {
  const [{ token }, { error }] = await Promise.all([params, searchParams]);
  const client = await getDatabasePool().connect();
  let valid: boolean;
  try {
    valid = await isPasswordRecoveryTokenValid(client, token);
  } finally {
    client.release();
  }

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
        <section className="auth-page__intro" aria-labelledby="recovery-complete-title">
          <p className="auth-page__eyebrow">Account access</p>
          <h1 id="recovery-complete-title">Choose a new password.</h1>
          <p>Set a new password to restore access to your Teacher Helper account.</p>
          <div className="auth-page__promise">
            <span aria-hidden="true" />
            <p>Your current sessions will end after the password changes.</p>
          </div>
        </section>
        <section className="auth-page__form-section" aria-labelledby="new-password-title">
          {valid ? (
            <>
              <p className="auth-page__eyebrow">Password recovery</p>
              <h2 id="new-password-title">Set new password</h2>
              <p className="auth-page__form-copy">
                Use at least 12 characters. Your recovery link can be used once.
              </p>
              {error === "password" || error === "mismatch" ? (
                <p className="auth-page__error" role="alert">
                  {error === "mismatch"
                    ? "The passwords do not match. Try again."
                    : "Use a password between 12 and 1024 characters."}
                </p>
              ) : null}
              <form
                className="auth-page__form"
                action={completePasswordRecoveryAction.bind(null, token)}
              >
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={1024}
                  required
                />
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={1024}
                  required
                />
                <button type="submit">Update password</button>
              </form>
            </>
          ) : (
            <>
              <p className="auth-page__eyebrow">Password recovery</p>
              <h2 id="new-password-title">Link unavailable</h2>
              <p className="auth-page__error" role="alert">
                This recovery link is invalid, expired, or already used. Request a new link to
                continue.
              </p>
              <a className="auth-page__form-recovery" href="/auth/recover">
                Request a new link
              </a>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
