import { useLocation } from 'react-router-dom';
import Card from './Card';
import { getCardsByPage } from './data';
import AchievementsPage from './AchievementsPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import HomePage from './HomePage';
import AudioProductionPage from './AudioProductionPage';

const routeToPage = {
  '/': 'home',
  '/about': 'about',
  '/achievements': 'achievements',
  '/contact': 'contact',
  '/articles': 'articles',
  '/projects/audio': 'projects-social',
  '/projects/broadcast': 'projects-broadcast',
  '/projects/tech': 'projects-tech',
};

const pageTitles = {
  'projects-broadcast': { title: 'Broadcast Projects', sub: 'Radio engineering, transmission, and broadcast infrastructure' },
  'projects-tech': { title: 'Tech Projects', sub: 'Full-stack development, tools, and digital innovation' },
  articles: { title: 'Articles', sub: 'Thoughts on broadcast engineering, tech, and audio production' },
};

export default function MainGrid({ onSelectArticle }) {
  const { pathname } = useLocation();
  const activePage = routeToPage[pathname] ?? 'home';

  if (activePage === 'home') return <HomePage />;
  if (activePage === 'achievements') return <AchievementsPage />;
  if (activePage === 'about') return <AboutPage />;
  if (activePage === 'contact') return <ContactPage />;
  if (activePage === 'projects-social') return <AudioProductionPage />;

  const cards = getCardsByPage(activePage);
  const meta = pageTitles[activePage];

  return (
    <section className="py-24 bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">{meta.sub}</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{meta.title}</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((item) => (
            <Card key={item.id} item={item} onClick={onSelectArticle} />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No content here yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
