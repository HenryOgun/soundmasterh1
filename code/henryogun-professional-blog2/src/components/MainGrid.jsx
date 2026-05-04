import { useLocation } from 'react-router-dom';
import { getCardsByPage } from './data';
import AchievementsPage from './AchievementsPage';
import AboutPage from './AboutPage';
import RecentExperiencePage from './RecentExperiencePage';
import HomePage from './HomePage';
import AudioProductionPage from './AudioProductionPage';
import ComputerRepairPage from './ComputerRepairPage';
import ArticlesPage from './ArticlesPage';
import ProjectsAdminPage from './ProjectsAdminPage';

const routeToPage = {
  '/': 'home',
  '/about': 'about',
  '/achievements': 'achievements',
  '/recentexperience': 'contact',
  '/articles': 'articles',
  '/projects/audio': 'projects-social',
  '/projects/broadcast': 'projects-broadcast',
  '/projects/tech': 'projects-tech',
  '/projects/repair': 'projects-repair',
};

export default function MainGrid({ onSelectArticle }) {
  const { pathname } = useLocation();
  const activePage = routeToPage[pathname] ?? 'home';

  if (activePage === 'home') return <HomePage />;
  if (activePage === 'achievements') return <AchievementsPage />;
  if (activePage === 'about') return <AboutPage />;
  if (activePage === 'contact') return <RecentExperiencePage />;
  if (activePage === 'articles') return <ArticlesPage />;
  if (activePage === 'projects-social') return <AudioProductionPage />;
  if (activePage === 'projects-repair') return <ComputerRepairPage />;
  if (activePage === 'projects-broadcast') return <ProjectsAdminPage pageType="broadcast" localData={getCardsByPage('projects-broadcast')} />;
  if (activePage === 'projects-tech') return <ProjectsAdminPage pageType="tech" localData={getCardsByPage('projects-tech')} />;

  return null;
}
