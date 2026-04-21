// Project sub-page — single layout, direction-flavored typography

function ProjectPage({ project, direction = "editorial", allProjects = [], onBack, onNavigate }) {
  const idx = allProjects.findIndex(p => p.id === project.id);
  const [lightboxShot, setLightboxShot] = React.useState(null);

  React.useEffect(() => {
    if (!lightboxShot) return;
    const onKey = (e) => { if (e.key === "Escape") setLightboxShot(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxShot]);
  const prev = idx > 0 ? allProjects[idx - 1] : null;
  const next = idx < allProjects.length - 1 ? allProjects[idx + 1] : null;

  const isEditorial = direction === "editorial";
  const isMono = direction === "mono";
  const isSans = !isEditorial;

  const titleClass = `pp-title${isSans ? " pp-title--sans" : ""}`;
  const blurbClass = `pp-blurb${isMono ? " pp-blurb--mono" : isSans ? " pp-blurb--sans" : ""}`;
  const sectionHClass = `pp-section-h${isSans ? " pp-section-h--sans" : ""}`;
  const sectionPClass = `pp-section-p${isMono ? " pp-section-p--mono" : isSans ? " pp-section-p--sans" : ""}`;
  const paginationTitleClass = `pp-pagination-title${isSans ? " pp-pagination-title--sans" : ""}`;

  return (
    <div className={`pp-wrap${isMono ? " pp-wrap--mono" : ""}`}>
      <div className="pp-nav">
        <a href="#/" onClick={(e) => { e.preventDefault(); onBack && onBack(); }} className="pp-nav-back">
          <span className="pp-nav-back-arrow">←</span> Back to portfolio
        </a>
        <span>{project.company} · {project.year}</span>
      </div>

      <window.ProjectTile project={project} size="hero" />

      <div className="pp-header">
        <div>
          <div className="pp-tag">{project.tag}</div>
          <h1 className={titleClass}>{project.title}</h1>
          <p className={blurbClass}>{project.blurb}</p>
        </div>
        <dl className="pp-meta">
          <div className="pp-meta-group">
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="pp-meta-group">
            <dt>When</dt>
            <dd>{project.year}</dd>
          </div>
          <div className="pp-meta-group">
            <dt>At</dt>
            <dd>{project.company}</dd>
          </div>
        </dl>
      </div>

      {project.shots && project.shots.length > 0 && (
        <section className="pp-shots">
          <div className="pp-shots-label">
            {isMono ? "// screenshots" : "Screenshots"}
          </div>
          <div className={`pp-shots-grid${project.shots.length < 3 ? " pp-shots-grid--pair" : ""}`}>
            {project.shots.map((s, i) => (
              <button key={i} className="pp-shot-btn" onClick={() => setLightboxShot(s)} aria-label={`View ${s.label} full size`}>
                <window.ProjectShot project={project} shot={s} />
              </button>
            ))}
          </div>
        </section>
      )}

      {lightboxShot && (
        <div className="pp-lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxShot(null)}>
          <div className="pp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="pp-lightbox-close" onClick={() => setLightboxShot(null)} aria-label="Close">✕</button>
            <window.ProjectShot project={project} shot={lightboxShot} style={{width: "100%", aspectRatio: "16/10"}} />
          </div>
        </div>
      )}

      <div className="pp-narrative">
        {project.sections.map((s, i) => (
          <section key={i} className="pp-section">
            <h2 className={sectionHClass}>
              {isMono ? `// ${s.h.toLowerCase()}` : s.h}
            </h2>
            <p className={sectionPClass}>{s.p}</p>
          </section>
        ))}
      </div>

      <nav className="pp-pagination">
        <div>
          {prev && (
            <a href={`#/project/${prev.id}`}
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(prev.id); }}
              className="pp-pagination-link">
              <div className="pp-pagination-label">← Previous</div>
              <div className={paginationTitleClass}>{prev.title}</div>
            </a>
          )}
        </div>
        <div className="pp-pagination-next">
          {next && (
            <a href={`#/project/${next.id}`}
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(next.id); }}
              className="pp-pagination-link">
              <div className="pp-pagination-label">Next →</div>
              <div className={paginationTitleClass}>{next.title}</div>
            </a>
          )}
        </div>
      </nav>
    </div>
  );
}

window.ProjectPage = ProjectPage;
