import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { filterCapstones } from '../lib/filters';
import { CAPSTONE_STATUS_LABELS } from '../lib/formatters';
import { MediaImage } from '../components/ui/MediaImage';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';

export function CapstonesPage() {
  const { capstones, capstoneMembers, profiles } = usePrototypeStore();
  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('all');
  const [status, setStatus] = useState('all');

  const academicYears = useMemo(
    () =>
      Array.from(new Set(capstones.map((c) => c.academic_year)))
        .sort()
        .reverse(),
    [capstones]
  );

  const filtered = useMemo(
    () => filterCapstones(capstones, search, academicYear, status),
    [capstones, search, academicYear, status]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Capstone Projects</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8CA]">
          Dedicated archive for moderated BSEMC Game Development capstone research and playable
          prototypes. Confidential, embargoed, or restricted thesis materials are never hosted here.
        </p>
      </div>

      {/* Search & Filter Row */}
      <section
        aria-label="Filter capstone projects"
        className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-[#242433] bg-[#111118] p-5 md:grid-cols-12"
      >
        <div className="md:col-span-6">
          <label htmlFor="capstone-search" className="block text-xs font-medium text-[#B8B8CA]">
            Search capstones
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8EA6]"
              aria-hidden="true"
            />
            <input
              id="capstone-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, abstract, research category, or technology..."
              className="min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] pl-10 pr-4 text-sm text-white placeholder-[#8E8EA6] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="capstone-year" className="block text-xs font-medium text-[#B8B8CA]">
            Academic Year
          </label>
          <select
            id="capstone-year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
          >
            <option value="all">All Years</option>
            {academicYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="capstone-status" className="block text-xs font-medium text-[#B8B8CA]">
            Project Status
          </label>
          <select
            id="capstone-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_development">In Development</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </section>

      {/* Capstone List */}
      <section className="mt-8 space-y-6" aria-label="Capstone archive list">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching capstone entries"
            description="Adjust your search term, academic year, or status filter to view sample capstones."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setAcademicYear('all');
                  setStatus('all');
                }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          filtered.map((cap) => {
            const members = capstoneMembers
              .filter((m) => m.capstone_id === cap.id)
              .map((m) => profiles.find((p) => p.id === m.profile_id)?.display_name)
              .filter(Boolean);

            return (
              <article
                key={cap.id}
                className="group grid grid-cols-1 overflow-hidden rounded-xl border border-[#242433] bg-[#111118] transition-colors hover:border-[#3A3459] lg:grid-cols-12"
              >
                <Link to={`/capstones/${cap.slug}`} className="lg:col-span-5">
                  <MediaImage
                    src={cap.cover_image_url}
                    alt={`${cap.title} capstone visual`}
                    fallbackTitle={cap.title}
                    aspectClass="aspect-video lg:h-full lg:aspect-auto"
                  />
                </Link>

                <div className="flex flex-col justify-between p-6 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8E8EA6]">
                      <StatusText
                        label={CAPSTONE_STATUS_LABELS[cap.project_status]}
                        tone={getGameStatusTone(cap.project_status)}
                      />
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">AY {cap.academic_year}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C4B5FD]">{cap.project_category}</span>
                    </div>

                    <h2 className="mt-2.5 text-xl font-bold text-white sm:text-2xl">
                      <Link to={`/capstones/${cap.slug}`} className="hover:text-[#C4B5FD]">
                        {cap.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#B8B8CA]">{cap.abstract}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#242433] pt-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[#D6D6E4]">
                        Researchers: {members.join(', ') || 'Sample Capstone Team'}
                      </p>
                      <p className="text-[#8E8EA6]">{cap.technology_stack.join(' · ')}</p>
                    </div>
                    <Link
                      to={`/capstones/${cap.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
                    >
                      Read Capstone
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
