// Portfolio grid — shown on home, direction-flavored

function PortfolioGrid({ projects, direction = "editorial", onOpenProject }) {
  const groups = {};
  projects.forEach(p => {
    const k = p.company;
    if (!groups[k]) groups[k] = [];
    groups[k].push(p);
  });
  const companyOrder = Array.from(new Set(projects.map(p => p.company)));

  const isSans = direction !== "editorial";

  return (
    <div>
      {companyOrder.map((company) => (
        <section key={company} className="pg-group">
          <div className="pg-group-header">
            <h3 className={`pg-group-title${isSans ? " pg-group-title--sans" : ""}`}>
              {direction === "mono" ? `// ${company.toLowerCase()}` : company}
            </h3>
            <div className="pg-group-count">
              {groups[company].length} {groups[company].length === 1 ? "project" : "projects"}
            </div>
          </div>
          <div className="pg-cards">
            {groups[company].map(project => (
              <a
                key={project.id}
                href={`#/project/${project.id}`}
                onClick={(e) => { e.preventDefault(); onOpenProject && onOpenProject(project.id); }}
                className="project-card"
              >
                <window.ProjectTile project={project} size="md" />
                <div className="pg-card-info">
                  <div className={`pg-card-title${isSans ? " pg-card-title--sans" : ""}`}>
                    {project.title}
                  </div>
                  <div className="pg-card-tag">{project.tag}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

window.PortfolioGrid = PortfolioGrid;
