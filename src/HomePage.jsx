// Editorial direction — full-screen hero + scrollable content below

function HeroArt() {
  return (
    <React.Fragment>
      <img
        aria-hidden="true"
        src="assets/bg.webp"
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
            <a href="https://dashlane.com" target="_blank" rel="noopener noreferrer">Dashlane</a>, where we're making the internet a safer place — one credential at a time.
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
            <p>Today I lead the Product Design team at <a href="https://dashlane.com" target="_blank" rel="noopener noreferrer">Dashlane</a>, where we're making the internet a safer place by protecting companies and individuals' credentials and secrets from breaches and phishing. Before that, I helped grow <a href="https://talkdesk.com" target="_blank" rel="noopener noreferrer">Talkdesk</a>'s design team from 4 to nearly 70, and helped build Cobalt — their design system — from scratch.</p>
            <p>I'm a fan of design systems, a sometime speaker and mentor, and I still like to get my hands dirty with the code when the mood strikes.</p>
            <p>Lately I've been exploring how AI is shifting the way we design and build products, and how to make the most of it while keeping the human touch.</p>
        </div>

        <h2 className="ed-section-label" id="work">Work</h2>
        <div className="ed-jobs">
          {data.work.map(job => {
            const jobProjects = data.projects.filter(p => p.workId === job.id);
            return (
              <div key={job.id} className="ed-job">
                <div className="ed-job-years">{job.years}</div>
                <div>
                  <h3 className="ed-job-company" id={job.id}>{job.company}</h3>
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
            <a href="https://linkedin.com/in/ivogomes" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:"-2px",marginRight:"5px"}}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>
          </div>
          <div className="ed-link-col">
            <a href="https://instagram.com/ivogomes" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:"-2px",marginRight:"5px"}}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>Instagram</a>
          </div>
          <div className="ed-link-col">
            <a href="/blog" target="_blank" rel="noopener noreferrer">Blog (archive)</a>
          </div>
          <div className="ed-link-col">
            <a href="/cv">Download my CV</a>
          </div>
        </div>

        <footer className="ed-footer">
          <span>© Ivo Gomes, {new Date().getFullYear()}</span>
          <span>Made with ❤️, in Lisbon 🇵🇹</span>
        </footer>
      </div>
    </React.Fragment>
  );
}

window.EditorialDirection = EditorialDirection;
