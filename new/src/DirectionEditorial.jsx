// Editorial direction — full-screen hero + scrollable content below

function HeroArt() {
  return (
    <React.Fragment>
      <img
        aria-hidden="true"
        src="assets/bg.jpg"
        style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover"}}
      />
      <div aria-hidden="true" style={{position:"absolute", inset:0, background:"rgba(0,0,0,0.35)"}} />
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
            <p>Today I lead the Product Design team at <a href="https://dashlane.com">Dashlane</a>, where we're making the internet a safer place by protecting companies and individuals' credentials and secrets from breaches and phishing. Before that, I helped grow <a href="https://talkdesk.com">Talkdesk</a>'s design team from 4 to nearly 70, and helped build Cobalt — their design system — from scratch.</p>
            <p>I'm a fan of design systems, a sometime speaker and mentor, and I still like to get my hands dirty with the code when the mood strikes.</p>
            <p>Lately I've been exploring how AI is shifting the way we design and build products, and how to make the most of it while keeping the human touch.</p>
        </div>

        <div className="ed-section-label">Work</div>
        <div className="ed-jobs">
          {data.work.map(job => {
            const jobProjects = data.projects.filter(p => p.workId === job.id);
            return (
              <div key={job.id} className="ed-job">
                <div className="ed-job-years">{job.years}</div>
                <div>
                  <h3 className="ed-job-company">{job.company}</h3>
                  <p className="ed-job-role">{job.role}</p>
                  <p className="ed-job-summary" dangerouslySetInnerHTML={{__html: job.summary}} />
                  {job.highlights.length > 0 && (
                    <ul className="ed-highlights">
                      {job.highlights.map((h, i) => (
                        <li key={i} className="ed-highlight">
                          <span>—</span>
                          <span dangerouslySetInnerHTML={{__html: h}} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {jobProjects.length > 0 && (
                    <div className="pg-cards" style={{marginTop: "1.5rem"}}>
                      {jobProjects.map(project => (
                        <a
                          key={project.id}
                          href={`#/project/${project.id}`}
                          onClick={(e) => { e.preventDefault(); onOpenProject && onOpenProject(project.id); }}
                          className="project-card"
                        >
                          <window.ProjectTile project={project} size="md" />
                          <div className="pg-card-info">
                            <div className="pg-card-title">{project.title}</div>
                            <div className="pg-card-tag">{project.tag}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ed-links">
          <div className="ed-link-col">
            <a href={data.links.linkedin}><i className="fa-brands fa-linkedin" aria-hidden="true"></i> LinkedIn</a>
          </div>
          <div className="ed-link-col">
            <a href={data.links.instagram}><i className="fa-brands fa-instagram" aria-hidden="true"></i> Instagram</a>
          </div>
          <div className="ed-link-col">
            <a href={data.links.cv}>Download my CV (PDF)</a>
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
