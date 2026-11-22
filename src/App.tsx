import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PrototypeStoreProvider } from './context/PrototypeStoreContext';
import { PageShell } from './components/layout/PageShell';
import { HomePage } from './pages/HomePage';
import { ExploreGamesPage } from './pages/ExploreGamesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { ArchivesPage } from './pages/ArchivesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { EventsPage } from './pages/EventsPage';
import { CapstonesPage } from './pages/CapstonesPage';
import { CapstoneDetailPage } from './pages/CapstoneDetailPage';
import { AlumniArchivePage } from './pages/AlumniArchivePage';
import { HallOfFamePage } from './pages/HallOfFamePage';
import { DeveloperProfilePage } from './pages/DeveloperProfilePage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { SubmitGamePage } from './pages/SubmitGamePage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { VotingPage } from './pages/VotingPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <PrototypeStoreProvider>
        <PageShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<ExploreGamesPage />} />
            <Route path="/games/:slug" element={<GameDetailPage />} />
            <Route path="/archives" element={<ArchivesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/capstones" element={<CapstonesPage />} />
            <Route path="/capstones/:slug" element={<CapstoneDetailPage />} />
            <Route path="/alumni" element={<AlumniArchivePage />} />
            <Route path="/hall-of-fame" element={<HallOfFamePage />} />
            <Route path="/developers/:username" element={<DeveloperProfilePage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/submit" element={<SubmitGamePage />} />
            <Route path="/admin" element={<AdminModerationPage />} />
            <Route path="/voting" element={<VotingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageShell>
      </PrototypeStoreProvider>
    </BrowserRouter>
  );
}

export default App;
