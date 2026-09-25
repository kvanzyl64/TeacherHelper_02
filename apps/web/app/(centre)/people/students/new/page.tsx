import { validateStudentAction } from "../../actions";

export default function NewStudentPage() {
  return (
    <main>
      <h1>Add student</h1>
      <form action={validateStudentAction}>
        <label htmlFor="reference">Reference</label>
        <input id="reference" name="reference" required />
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required />
        <button type="submit">Save student</button>
      </form>
    </main>
  );
}