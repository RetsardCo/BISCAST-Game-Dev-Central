import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { ButtonLink } from '../ui/Button';

const PRIMARY_LINKS = [
  { to: '/games', label: 'Explore' },
  { to: '/capstones', label: 'Capstones' },
  { to: '/events', label: 'Events' },
  { to: '/archives', label: 'Archives' },
];

const COMMUNITY_LINKS = [
  { to: '/hall-of-fame', label: 'Hall of Fame', note: 'Awards & honors' },
  { to: '/alumni', label: 'Alumni Archive', note: 'Graduated batches' },
  { to: '/categories', label: 'Categories', note: 'Browse by genre' },
  { to: '/voting', label: 'Voting', note: 'Prototype ballot' },
  { to: '/dashboard', label: 'Student Dashboard', note: 'Submissions & profile' },
  { to: '/admin', label: 'Admin Console', note: 'Moderation prototype' },
  { to: '/about', label: 'About & Policy', note: 'Scope & TBD items' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const isCommunityActive = COMMUNITY_LINKS.some((item) =>
    location.pathname.startsWith(item.to)
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#242433] bg-[#09090D]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          <BrandMark />
          <span>BISCAST Game Dev Central</span>
        </Link>

        {/* Zone 2: 5 Concise Single-Line Nav Links (Desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {PRIMARY_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-white underline decoration-[#7C3AED] decoration-2 underline-offset-8'
                    : 'text-[#B8B8CA] hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isCommunityActive || menuOpen
                  ? 'text-white'
                  : 'text-[#B8B8CA] hover:text-white'
              }`}
            >
              Community
              <ChevronDown
                className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Community and prototype workspace links"
                className="absolute right-0 mt-3 w-64 rounded-xl border border-[#2E2E42] bg-[#111118] p-2 shadow-xl"
              >
                {COMMUNITY_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    className="flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-[#181822]"
                  >
                    <span className="text-sm font-medium text-[#F8F8FA]">{item.label}</span>
                    <span className="text-xs text-[#8E8EA6]">{item.note}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Single Primary Action (Desktop) + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:block">
            <ButtonLink to="/submit" size="sm">
              Submit Game
            </ButtonLink>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#F8F8FA] hover:bg-[#181822] lg:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Panel */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#242433] bg-[#0D0D14] px-4 pb-6 pt-4 lg:hidden"
        >
          <div className="space-y-1">
            {PRIMARY_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-[#181822] text-white' : 'text-[#B8B8CA] hover:bg-[#14141D] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 border-t border-[#242433] pt-4">
            <p className="px-3 text-xs font-medium text-[#8E8EA6]">Community & Workspaces</p>
            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {COMMUNITY_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm ${
                      isActive ? 'bg-[#181822] text-white font-medium' : 'text-[#B8B8CA] hover:bg-[#14141D] hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <ButtonLink to="/submit" className="w-full">
              Submit Game
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
