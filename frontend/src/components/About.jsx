import "../pages/About.css";



const VALUES = [
  {
    emoji: "❤️",
    title: "Compassion First",
    desc:  "Every donor and recipient is treated with care, dignity, and respect at every step.",
  },
  {
    emoji: "🔒",
    title: "Trust & Safety",
    desc:  "All profiles are verified by our admin team before being activated on the platform.",
  },
  {
    emoji: "⚡",
    title: "Speed Matters",
    desc:  "In emergencies, every second counts. We connect donors and recipients in real time.",
  },
];

const TEAM = [
  {
    initial: "O",
    name:    "Omjee",
    role:    "Chat Server & Nearby Donors Feature",
    bio:     "Worked on real-time chat integration and the nearby donor geolocation feature.",
  },
  {
    initial: "N",
    name:    "Nitish",
    role:    "Documentation & Testing",
    bio:     "Handled comprehensive documentation and rigorous testing to ensure platform reliability.",
  },
  {
    initial: "N",
    name:    "Naitik",
    role:    "Frontend Developer",
    bio:     "Designed and developed the user interface, making the platform accessible and intuitive.",
  },
  {
    initial: "P",
    name:    "Piyush",
    role:    "Backend & Authentication",
    bio:     "Managed server architecture, secure API endpoints, and robust user authentication.",
  },
];

export default function AboutPage() {
  return (
    <div>


      <div className="about-hero">
        <div className="about-tag">Our Story</div>
        <h1>About PulseConnect 🩸</h1>
        <p>
          We started PulseConnect with one mission — make it effortless
          for people to donate blood and organs, and for those in need
          to find a match quickly and safely.
        </p>
      </div>


      <div className="about-page">

        <div className="mission">

          <div>
            <div className="section-tag">Our Mission</div>
            <h2 className="section-heading">Why PulseConnect Exists</h2>
            <p className="section-text">
              Every year, thousands of people in India die because they
              cannot find a matching blood or organ donor in time.
              PulseConnect was created to bridge that gap — connecting
              willing donors with patients who urgently need help.
              <br /><br />
              We believe technology can save lives. Our platform makes
              it simple to register as a donor, get verified, and be
              notified when someone nearby needs you.
            </p>
          </div>

          <div className="mission-card">
            <h3>🎯 Our Goal</h3>
            <p>
              To build India's largest, most trusted network of blood
              and organ donors — where every registered user can
              potentially save a life with a single click.
              <br /><br />
              We aim to cover all major Indian cities and make same-day
              donor matching a reality for hospitals and patients.
            </p>
          </div>

        </div>


        <div className="values">
          <div className="section-tag">What We Stand For</div>
          <h2 className="section-heading">Our Core Values</h2>

          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value-card" key={v.title}>
                <div className="value-emoji">{v.emoji}</div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>


        <div className="team">
          <div className="section-tag">The People</div>
          <h2 className="section-heading">Meet Our Team</h2>

          <div className="team-grid">
            {TEAM.map(member => (
              <div className="team-card" key={member.name}>
              <div className="team-avatar">{member.initial}</div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <div className="team-bio">{member.bio}</div>
              </div>
            ))}
          </div>
        </div>


        <div className="cta-strip">
          <h2>Ready to Save a Life? 🩸</h2>
          <p>
            Join thousands of donors on PulseConnect today.<br />
            Registration takes less than 2 minutes.
          </p>
          <button className="btn-cta">Register as a Donor</button>
        </div>

      </div>


      <footer className="footer">
        Made with <span>❤️</span> by PulseConnect Team — Saving lives, one donation at a time.
      </footer>

    </div>
  );
}