import { createCentreAction } from "./actions";

export default function OnboardingPage() {
  return (
    <main>
      <h1>Centre onboarding</h1>
      <p>Set up trial or subscription access and invite your team.</p>
      <form action={createCentreAction}>
        <label htmlFor="name">Centre name</label>
        <input id="name" name="name" defaultValue="Demo Centre" />
        <label htmlFor="timezone">Timezone</label>
        <input id="timezone" name="timezone" defaultValue="Africa/Johannesburg" />
        <label htmlFor="plan">Plan</label>
        <select id="plan" name="plan" defaultValue="trial">
          <option value="trial">Trial</option>
          <option value="subscription">Subscription</option>
        </select>
      </form>
    </main>
  );
}
