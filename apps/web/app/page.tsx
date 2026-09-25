export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f6f7fb 0%, #eef7ff 100%)",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "980px",
          background: "#ffffff",
          border: "1px solid #dfe7f4",
          borderRadius: "18px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          padding: "56px 48px 32px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#0f766e",
            }}
          >
            Saas for tutoring centres
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, color: "#111827" }}>
            Teacher Helper
          </h1>
          <p style={{ margin: 0, maxWidth: "700px", fontSize: "1.15rem", lineHeight: 1.7, color: "#374151" }}>
            A secure operations workspace for tutoring centres to manage students, guardian updates,
            session communication, billing, and operational oversight from one place.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "8px" }}>
            <a
              href="/auth/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "46px",
                padding: "0 22px",
                borderRadius: "10px",
                background: "#0f172a",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Log in
            </a>
            <a
              href="/auth/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "46px",
                padding: "0 22px",
                borderRadius: "10px",
                background: "#e0f2fe",
                color: "#0f172a",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create account
            </a>
          </div>

          <ul style={{ margin: "12px 0 0", paddingLeft: "20px", color: "#374151", lineHeight: 1.8, fontSize: "1rem" }}>
            <li>Keep families informed with approved session and invoice updates.</li>
            <li>Protect every school record with tenant-aware access and role-based permissions.</li>
            <li>Give centre leads a clear overview of students, billing, and unresolved issues.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}