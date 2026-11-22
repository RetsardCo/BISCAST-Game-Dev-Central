import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#242433] bg-[#0C0C12]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-base font-bold text-white">
                BISCAST Game Dev Central
              </span>
            </div>
            <p className="text-sm font-medium text-[#C4B5FD]">
              BSEMC · Game Development Community
            </p>
            <p className="max-w-md text-sm leading-relaxed text-[#8E8EA6]">
              Curated public showcase and archive for student-developed games, capstone projects,
              and community events. Phase 0–2 frontend prototype powered by clearly labeled local
              sample data; live Supabase authentication, RLS, and storage follow in Phases 3–8.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#F8F8FA]">Showcase & Archives</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#B8B8CA]">
              <li>
                <Link to="/games" className="hover:text-white">
                  Explore Games
                </Link>
              </li>
              <li>
                <Link to="/archives" className="hover:text-white">
                  Academic Years
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/capstones" className="hover:text-white">
                  Capstone Projects
                </Link>
              </li>
              <li>
                <Link to="/alumni" className="hover:text-white">
                  Alumni Archive
                </Link>
              </li>
              <li>
                <Link to="/hall-of-fame" className="hover:text-white">
                  Hall of Fame
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#F8F8FA]">Community & Prototypes</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#B8B8CA]">
              <li>
                <Link to="/events" className="hover:text-white">
                  Announcements & Events
                </Link>
              </li>
              <li>
                <Link to="/voting" className="hover:text-white">
                  Voting Interface (Prototype)
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white">
                  Student Dashboard (Prototype)
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-white">
                  Submit a Game (Prototype)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white">
                  Admin Moderation (Prototype)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About, Policy & TBD Log
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#242433] pt-6 text-xs text-[#8E8EA6] sm:flex-row sm:items-center sm:justify-between">
          <p>
            External builds hosted on itch.io; trailers hosted on YouTube. Student creators retain
            ownership of their work.
          </p>
          <p>Institutional branding & policies: TBD confirmation</p>
        </div>
      </div>
    </footer>
  );
}
