import { Link } from 'react-router-dom';
import { UNRESOLVED_DECISIONS_TBD } from '../data/mockDataset';
import { ButtonLink } from '../components/ui/Button';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <p className="text-sm font-medium text-[#C4B5FD]">BSEMC · Game Development Community</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          About BISCAST Game Dev Central
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#B8B8CA]">
          A curated public showcase and long-term digital archive built to make student games
          discoverable, provide moderated student submissions, and preserve capstone projects and
          alumni portfolios across academic years.
        </p>
      </div>

      {/* Scope & Principles */}
      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
          <h2 className="text-lg font-semibold text-white">Guiding Principles</h2>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#B8B8CA]">
            <li>
              <strong className="text-white">Student work first:</strong> clear creator attribution
              for every game and capstone entry.
            </li>
            <li>
              <strong className="text-white">Curated publication:</strong> submissions enter{' '}
              <code className="font-mono text-xs text-[#C4B5FD]">pending_review</code> and require
              moderator approval before appearing publicly.
            </li>
            <li>
              <strong className="text-white">Low operating cost:</strong> game builds stay on
              itch.io and trailers on YouTube rather than self-hosted binaries.
            </li>
            <li>
              <strong className="text-white">Security by design:</strong> Phase 3+ enforces access
              via PostgreSQL Row Level Security (RLS), never UI route guards alone.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
          <h2 className="text-lg font-semibold text-white">Phase 0–2 Prototype Boundary</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#B8B8CA]">
            This build is the Phase 0–2 frontend showcase prototype prepared for handoff to
            Antigravity (Phases 3–8). All data runs locally from typed mock contracts compatible
            with <code className="font-mono text-xs text-[#C4B5FD]">04_DATA_MODEL.md</code>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#B8B8CA]">
            No Firebase/Firestore dependencies, no production backend, no secrets, and no fake
            authentication or fake voting persistence are included.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink to="/games?state=loading" variant="secondary" size="sm">
              Preview Loading State
            </ButtonLink>
            <ButtonLink to="/games?state=error" variant="secondary" size="sm">
              Preview Error State
            </ButtonLink>
            <ButtonLink to="/not-found-preview" variant="ghost" size="sm">
              Preview 404 Page
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Unresolved Decisions Log (TBD) */}
      <section className="mt-12 border-t border-[#242433] pt-10" aria-labelledby="tbd-heading">
        <h2 id="tbd-heading" className="text-2xl font-bold text-white">
          Unresolved Institutional Decisions (TBD)
        </h2>
        <p className="mt-2 text-sm text-[#B8B8CA]">
          Per project governance, the items below require project-owner and institutional
          confirmation before production launch and are never invented by the frontend.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-[#242433] bg-[#111118]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#242433] text-xs text-[#8E8EA6]">
                <th className="px-5 py-3.5 font-medium">ID</th>
                <th className="px-5 py-3.5 font-medium">Decision Topic</th>
                <th className="px-5 py-3.5 font-medium">Details Requiring Confirmation</th>
                <th className="px-5 py-3.5 font-medium">Target Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242433]">
              {UNRESOLVED_DECISIONS_TBD.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#C4B5FD]">
                    {item.id}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{item.topic}</td>
                  <td className="px-5 py-4 text-[#B8B8CA]">{item.detail}</td>
                  <td className="px-5 py-4 text-xs text-[#8E8EA6] whitespace-nowrap">
                    {item.phase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-[#8E8EA6]">
          Looking to test the prototype workspaces? Visit the{' '}
          <Link to="/dashboard" className="text-[#C4B5FD] hover:underline">
            Student Dashboard
          </Link>
          ,{' '}
          <Link to="/submit" className="text-[#C4B5FD] hover:underline">
            Submit a Game
          </Link>
          ,{' '}
          <Link to="/admin" className="text-[#C4B5FD] hover:underline">
            Admin Moderation Console
          </Link>
          , or{' '}
          <Link to="/voting" className="text-[#C4B5FD] hover:underline">
            Voting Interface
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
