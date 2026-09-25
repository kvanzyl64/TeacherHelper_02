import styles from "./page.module.css";

type IconName =
  | "arrow-right"
  | "check"
  | "dashboard"
  | "lock"
  | "message"
  | "people"
  | "plus"
  | "sessions";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
      <use href={`/images/line-art/icons.svg#${name}`} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className={styles.siteShell}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="/" aria-label="Teacher Helper home">
          <span className={styles.brandMark}>TH</span>
          Teacher Helper
        </a>

        <div className={styles.navLinks}>
          <a href="#workflow">How it works</a>
          <a href="#trust">Trust and privacy</a>
        </div>

        <div className={styles.navActions}>
          <a className={styles.quietLink} href="/auth/login">
            Log in
          </a>
          <a className={styles.navCta} href="/auth/signup">
            Start free
            <Icon name="arrow-right" size={15} />
          </a>
        </div>
      </nav>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Tutoring centre operations, made human
          </p>
          <h1 id="hero-title">
            Make every lesson feel <em>connected.</em>
          </h1>
          <p className={styles.heroIntro}>
            Teacher Helper gives small tutoring centres one calm place for students, tutors,
            guardian updates, and term billing. Less chasing. More teaching.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="/auth/signup">
              Create your centre
              <Icon name="arrow-right" />
            </a>
            <a className={styles.secondaryCta} href="#workflow">
              See how it works
            </a>
          </div>
          <p className={styles.secureNote}>
            <Icon name="lock" size={15} />
            Secure by design. No parent portal to manage.
          </p>
        </div>

        <div className={styles.workspace} aria-label="Teacher Helper workspace preview">
          <div className={styles.workspacePanel}>
            <div className={styles.panelBar}>
              <div className={styles.panelBrand}>
                <span aria-hidden="true" />
                Teacher Helper / Overview
              </div>
              <span className={styles.panelMeta}>Tuesday, 25 Sep</span>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.panelMain}>
                <p className={styles.panelKicker}>Good morning, Nandi</p>
                <h2 className={styles.panelTitle}>The centre at a glance.</h2>

                <div className={styles.panelStats}>
                  <div className={styles.stat}>
                    <strong>42</strong>
                    <span>active students</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>18</strong>
                    <span>sessions this week</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>96%</strong>
                    <span>updates delivered</span>
                  </div>
                </div>

                <div className={styles.activity}>
                  <div className={styles.activityHeading}>
                    <span>Recent activity</span>
                    <span>All caught up</span>
                  </div>
                  <ul className={styles.activityList}>
                    <li className={styles.activityItem}>
                      <span className={`${styles.activityIcon} ${styles.coralIcon}`}>
                        <Icon name="sessions" size={17} />
                      </span>
                      <span>
                        <strong>Session approved</strong>
                        <small>Thandi M. / Mathematics</small>
                      </span>
                      <span className={styles.activityTime}>09:42</span>
                    </li>
                    <li className={styles.activityItem}>
                      <span className={`${styles.activityIcon} ${styles.cyanIcon}`}>
                        <Icon name="message" size={17} />
                      </span>
                      <span>
                        <strong>Guardian update sent</strong>
                        <small>Link opened by Sipho&apos;s guardian</small>
                      </span>
                      <span className={styles.activityTime}>09:18</span>
                    </li>
                    <li className={styles.activityItem}>
                      <span className={`${styles.activityIcon} ${styles.greenIcon}`}>
                        <Icon name="check" size={17} />
                      </span>
                      <span>
                        <strong>Payment recorded</strong>
                        <small>Invoice TH-0241 / EFT</small>
                      </span>
                      <span className={styles.activityTime}>08:56</span>
                    </li>
                  </ul>
                </div>
              </div>

              <aside className={styles.panelSide}>
                <p className={styles.sideLabel}>The human bit</p>
                <img src="/images/line-art/character-helper.svg" alt="Learning helper" />
                <p className={styles.sideNote}>A little more room for the work that matters.</p>
              </aside>
            </div>
          </div>
          <p className={styles.stickyNote}>Your admin should feel this clear.</p>
        </div>
      </section>

      <section className={styles.proofStrip} id="trust" aria-label="Teacher Helper principles">
        <div className={styles.proofIntro}>
          <p>Built for the rhythm of a real tutoring centre, not a spreadsheet pretending to be one.</p>
        </div>
        <div className={styles.proofItem}>
          <Icon name="people" size={24} />
          <div>
            <strong>One shared picture</strong>
            <p>Students, tutors, and guardians in context.</p>
          </div>
        </div>
        <div className={styles.proofItem}>
          <Icon name="message" size={24} />
          <div>
            <strong>Updates that land</strong>
            <p>Approved session notes sent on WhatsApp.</p>
          </div>
        </div>
        <div className={styles.proofItem}>
          <Icon name="lock" size={24} />
          <div>
            <strong>Privacy by default</strong>
            <p>Every centre and family stays in its lane.</p>
          </div>
        </div>
      </section>

      <section className={styles.featureSection} id="workflow" aria-labelledby="workflow-title">
        <p className={styles.sectionLabel}>The whole centre, in one system</p>
        <h2 id="workflow-title">Keep the important things moving.</h2>
        <p className={styles.sectionIntro}>
          Teacher Helper connects the small moments that make a centre trustworthy: a clear student
          record, a thoughtful update, and a payment that does not need three follow-ups.
        </p>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.coralFeature}`}>
              <Icon name="dashboard" size={22} />
            </div>
            <h3>Know what is happening.</h3>
            <p>See your people, sessions, outstanding invoices, and follow-ups without hunting through tabs.</p>
          </article>
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.cyanFeature}`}>
              <Icon name="sessions" size={22} />
            </div>
            <h3>Share the right detail.</h3>
            <p>Approve a session update, send one secure link, and keep guardians close to the learning.</p>
          </article>
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.greenFeature}`}>
              <Icon name="plus" size={22} />
            </div>
            <h3>Make admin feel lighter.</h3>
            <p>Record payments, follow delivery, and give your team a dependable place to pick things up.</p>
          </article>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <h2 id="closing-title">
          Ready to make the centre feel <em>clearer?</em>
        </h2>
        <a className={styles.primaryCta} href="/auth/signup">
          Start your workspace
          <Icon name="arrow-right" />
        </a>
      </section>

      <footer className={styles.footer}>
        <p>Teacher Helper / A calmer centre, one lesson at a time.</p>
        <div className={styles.footerLinks}>
          <a href="/auth/login">Log in</a>
          <a href="/auth/signup">Create account</a>
        </div>
      </footer>
    </main>
  );
}