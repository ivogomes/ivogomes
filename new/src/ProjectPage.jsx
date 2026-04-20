// Project sub-page — single layout, direction-flavored typography

function ProjectPage({ project, direction = "editorial", allProjects = [], onBack, onNavigate }) {
  const idx = allProjects.findIndex(p => p.id === project.id);
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
              <window.ProjectShot key={i} project={project} shot={s} />
            ))}
          </div>
        </section>
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
