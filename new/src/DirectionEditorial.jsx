// Editorial direction — full-screen hero + scrollable content below

function HeroArt() {
  return (
    <React.Fragment>
      <svg aria-hidden="true" style={{position:"absolute", inset:0, width:"100%", height:"100%", opacity: 0.16}}>
        <defs>
          <pattern id="hero-dots-fs" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#2A1A08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots-fs)" />
      </svg>
      <svg aria-hidden="true" style={{position:"absolute", inset:0, width:"100%", height:"100%"}}>
        <circle cx="8%" cy="82%" r="90" fill="#6A4AA8" opacity="0.75" />
        <circle cx="92%" cy="18%" r="64" fill="#2E6F5E" opacity="0.8" />
        <circle cx="78%" cy="78%" r="36" fill="#F6ECFF" opacity="0.6" />
        <circle cx="22%" cy="14%" r="22" fill="#FFF8E8" opacity="0.7" />
        <circle cx="60%" cy="40%" r="14" fill="#FFF8E8" opacity="0.35" />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 105%, rgba(42,26,8,0.22), transparent 55%)",
        pointerEvents: "none",
      }} />
    </React.Fragment>
  );
}

function EditorialDirection({ data, onOpenProject }) {
  const scrollDown = () => {
    const target = document.getElementById("bio");
    if (target) target.scrollIntoView({behavior: "smooth", block: "start"});
  };

  return (
    <React.Fragment>
      <section className="ed-hero">
        <HeroArt />

        <div className="ed-hero-top-bar">
          <span>Ivo Gomes</span>
          <span>{"\n"}</span>
        </div>

        <div className="ed-hero-center">
          <h1 className="ed-hero-hi">
            Hi,<br/>I'm <span>Ivo.</span>
          </h1>
          <p className="ed-hero-tagline">
            I'm a product design leader based in Lisbon. These days I'm Director of Product Design at{" "}
            <a href="https://dashlane.com">Dashlane</a>, where we're making the internet a safer place — one credential at a time.
          </p>
        </div>

        <div className="ed-hero-bottom-bar">
          <span>Director of Product Design · Dashlane</span>
          <button
            onClick={scrollDown}
            className="scroll-cue"
            aria-label="Scroll down"
          >
            <span>Scroll</span>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
              <path d="M7 1v14M1 10l6 6 6-6" stroke="#FFF8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      <div className="ed-wrap" id="bio">
        <p className="ed-bio-intro">
          I'm passionate about minimalist, functional design — the kind where nothing's out of place and everything earns its spot.
        </p>

        <div className="ed-bio">
          {data.intro.paragraphs.slice(1).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="ed-section-label">Portfolio</div>
        <window.PortfolioGrid projects={data.projects} direction="editorial" onOpenProject={onOpenProject} />

        <div className="ed-section-label">Selected Work</div>
        <div className="ed-jobs">
          {data.work.map(job => (
            <div key={job.id} className="ed-job">
              <div className="ed-job-years">{job.years}</div>
              <div>
                <h3 className="ed-job-company">{job.company}</h3>
                <p className="ed-job-role">{job.role}</p>
                <p className="ed-job-summary">{job.summary}</p>
                {job.highlights.length > 0 && (
                  <ul className="ed-highlights">
                    {job.highlights.map((h, i) => (
                      <li key={i} className="ed-highlight">
                        <span>—</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="ed-section-label">Elsewhere</div>
        <div className="ed-links">
          <div className="ed-link-col">
            <a href={data.links.linkedin}>LinkedIn</a>
          </div>
          <div className="ed-link-col">
            <a href={data.links.instagram}>Instagram</a>
          </div>
          <div className="ed-link-col">
            <a href={data.links.cv}>CV (PDF)</a>
          </div>
        </div>

        <div className="ed-footer">
          <span>© Ivo Gomes, 2026</span>
          <span>Made with care, in Lisbon</span>
        </div>
      </div>
    </React.Fragment>
  );
}

window.EditorialDirection = EditorialDirection;
