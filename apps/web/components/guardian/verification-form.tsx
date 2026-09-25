import type { FormHTMLAttributes } from "react";

export function GuardianVerificationForm(props: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props}>
      <label htmlFor="code">Verification code</label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required />
      <button type="submit">Confirm number</button>
    </form>
  );
}