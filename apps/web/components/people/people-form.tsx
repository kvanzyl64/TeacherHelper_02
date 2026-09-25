export function PeopleField(props: { id: string; label: string; type?: "text" | "tel" }) {
  return (
    <label htmlFor={props.id}>
      {props.label}
      <input id={props.id} name={props.id} type={props.type ?? "text"} required />
    </label>
  );
}