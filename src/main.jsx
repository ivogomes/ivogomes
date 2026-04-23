import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ProjectPage } from './ProjectPage.jsx';
import { EditorialDirection } from './HomePage.jsx';
import IVO_DATA from './data.js';

function parseHash() {
  const h = window.location.hash || '';
  const m = h.match(/^#\/project\/([a-z0-9-]+)/i);
  return m ? m[1] : null;
}

function App() {
  const [projectId, setProjectId] = useState(() => parseHash());

  useEffect(() => {
    const onHash = () => setProjectId(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openProject = (id) => {
    window.location.hash = '#/project/' + id;
    setProjectId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const backToHome = () => {
    window.location.hash = '';
    setProjectId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (projectId) {
    const project = IVO_DATA.projects.find(p => p.id === projectId);
    if (project) {
      return <ProjectPage
        project={project}
        direction="editorial"
        allProjects={IVO_DATA.projects}
        onBack={backToHome}
        onNavigate={openProject}
      />;
    }
  }

  return <EditorialDirection data={IVO_DATA} onOpenProject={openProject} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
