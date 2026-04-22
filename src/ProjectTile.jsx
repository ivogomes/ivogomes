// Shared: project tile (placeholder image) + project page layout

function ProjectTile({ project, size = "lg", showText = true, style = {} }) {
  const isHero = size === "hero";
  const titleClass = `tile-title${isHero ? " tile-title--hero" : size === "lg" ? " tile-title--lg" : ""}`;

  return (
    <div
      data-tile
      className={`tile tile--${size}`}
      style={{background: project.tileColor, color: project.tileInk, ...style}}
    >
      {!project.tileImg && (
        <svg className="tile-texture" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id={`stripes-${project.id}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
              <rect x="0" y="0" width="14" height="14" fill="transparent" />
              <rect x="0" y="0" width="1" height="14" fill={project.tileInk} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#stripes-${project.id})`} />
        </svg>
      )}

      {!project.tileImg && (
        <div className={`tile-initials tile-initials--${size}`} style={{color: project.tileInk}}>
          {project.initials}
        </div>
      )}

      {project.tileImg && (
        <img src={isHero ? project.tileImg : (project.tileImgThumb || project.tileImg)} alt={project.title} className="tile-img" loading="lazy" />
      )}

      {showText && !project.tileImg && (
        <>
          <div className={`tile-meta${isHero ? " tile-meta--hero" : ""}`}>
            {project.company} · {project.year}
          </div>
          <div className="tile-bottom">
            <div className={titleClass}>{project.title}</div>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectShot({ project, shot, style = {}, showNote = false, thumb = false }) {
  return (
    <figure className="shot" style={{background: project.tileColor, color: project.tileInk, ...style}}>
      {shot.img ? (
        <>
          <img src={thumb ? (shot.imgThumb || shot.img) : shot.img} alt={shot.label} className="shot-img" loading="lazy" />
          <div className="shot-shade" />
        </>
      ) : (
        <>
          <svg className="shot-texture" aria-hidden="true">
            <defs>
              <pattern id={`shot-s-${project.id}-${shot.label}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.6" fill={project.tileInk} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#shot-s-${project.id}-${shot.label})`} />
          </svg>
        </>
      )}
      <figcaption className="shot-footer">
        <span className="shot-label">{shot.label}</span>
        {showNote && <span className="shot-note">{shot.note}</span>}
      </figcaption>
    </figure>
  );
}

function HeroBackdrop({ direction = "editorial" }) {
  if (direction === "editorial") {
    return (
      <div className="hb-editorial">
        <svg className="hb-svg hb-editorial-dots" aria-hidden="true">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#2A1A08" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <svg className="hb-svg" aria-hidden="true">
          <circle cx="12%" cy="78%" r="60" fill="#6A4AA8" opacity="0.85" />
          <circle cx="88%" cy="22%" r="42" fill="#2E6F5E" opacity="0.85" />
          <circle cx="70%" cy="75%" r="28" fill="#F6ECFF" opacity="0.7" />
          <circle cx="30%" cy="20%" r="18" fill="#FFF8E8" opacity="0.8" />
        </svg>
        <div className="hb-editorial-name">Ivo.</div>
        <div className="hb-label hb-label--tl">Portfolio · 2026</div>
        <div className="hb-label hb-label--br">Lisbon · Portugal</div>
      </div>
    );
  }
  if (direction === "swiss") {
    return (
      <div className="hb-swiss">
        <svg className="hb-svg hb-swiss-grid" aria-hidden="true">
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2A1A12" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <div className="hb-swiss-inner">
          <div className="hb-swiss-name">Ivo Gomes</div>
          <div className="hb-swiss-section">§ 01<br/>Introduction</div>
        </div>
      </div>
    );
  }
  return (
    <div className="hb-mono">
      <pre className="hb-mono-pre" aria-hidden="true">
{`$ cat ~/ivo.txt
---
name: Ivo Gomes
role: Director of Product Design
where: Dashlane (Lisbon, PT)
likes: [design systems, minimalism, details]
---
// output truncated for humans`}
      </pre>
      <div className="hb-mono-name">Hi, I'm Ivo.</div>
    </div>
  );
}

window.ProjectTile = ProjectTile;
window.ProjectShot = ProjectShot;
window.HeroBackdrop = HeroBackdrop;
