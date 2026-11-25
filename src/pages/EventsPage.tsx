import { useState } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import {
  COMPETITION_STATUS_LABELS,
  COMPETITION_TYPE_LABELS,
  formatUtcDate,
} from '../lib/formatters';
import { isStrictHttpsUrl } from '../lib/urlSafety';
import { ButtonLink } from '../components/ui/Button';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/States';

type EventsTab = 'announcements' | 'competitions';

export function EventsPage() {
  const { announcements, competitions } = usePrototypeStore();
  const [activeTab, setActiveTab] = useState<EventsTab>('announcements');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const publishedAnnouncements = announcements.filter((a) => a.status === 'published');
  const filteredAnnouncements =
    categoryFilter === 'all'
      ? publishedAnnouncements
      : publishedAnnouncements.filter((a) => a.category === categoryFilter);

  const announcementCategories = Array.from(
    new Set(publishedAnnouncements.map((a) => a.category))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-[#242433] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Announcements &amp; Events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B8B8CA]">
            Community notices, semester submission schedules, game jams, and showcase competitions.
            Draft announcements remain hidden until published by authorized staff.
          </p>
        </div>

        <Tabs<EventsTab>
          ariaLabel="Switch between announcements and competitions"
          activeId={activeTab}
          onChange={setActiveTab}
          items={[
            { id: 'announcements', label: 'Announcements', count: publishedAnnouncements.length },
            { id: 'competitions', label: 'Competitions & Jams', count: competitions.length },
          ]}
        />
      </div>

      {activeTab === 'announcements' ? (
        <section className="mt-8" aria-label="Published announcements">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`min-h-[36px] rounded-lg px-3.5 text-xs font-medium cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-[#7C3AED] text-white'
                  : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
              }`}
            >
              All Categories
            </button>
            {announcementCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[36px] rounded-lg px-3.5 text-xs font-medium cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#7C3AED] text-white'
                    : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              title="No announcements in this category"
              description="Published community notices will appear here once posted."
            />
          ) : (
            <div className="space-y-5">
              {filteredAnnouncements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#242433] bg-[#111118] p-6"
                >
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#8E8EA6]">
                    <span className="font-medium text-[#C4B5FD]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <time className="tabular-nums">Published {formatUtcDate(item.published_at)}</time>
                    {item.expires_at && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Closes {formatUtcDate(item.expires_at)}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#D6D6E4]">{item.summary}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#B8B8CA]">{item.body}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-8 space-y-6" aria-label="Competitions and game jams">
          {competitions.map((comp) => {
            const safeRegUrl = isStrictHttpsUrl(comp.external_registration_url)
              ? comp.external_registration_url
              : null;
            return (
              <article
                key={comp.id}
                className="rounded-xl border border-[#242433] bg-[#111118] p-6"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-[#242433] pb-5 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8E8EA6]">
                      <StatusText
                        label={COMPETITION_STATUS_LABELS[comp.status]}
                        tone={getGameStatusTone(comp.status)}
                      />
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C4B5FD]">
                        {COMPETITION_TYPE_LABELS[comp.event_type]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{comp.organizer}</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-white">{comp.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8CA]">
                      {comp.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {comp.event_type === 'voting_event' && (
                      <ButtonLink to="/voting" size="sm">
                        {comp.status === 'open' ? 'Open Voting Ballot' : 'View Results'}
                      </ButtonLink>
                    )}
                    {safeRegUrl && (
                      <a
                        href={safeRegUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#2E2E42] bg-[#181822] px-3.5 text-xs font-medium text-white hover:bg-[#222230] whitespace-nowrap"
                      >
                        External Resource
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-[#8E8EA6]">Schedule &amp; Timezone</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm tabular-nums text-white">
                      <Calendar className="h-4 w-4 text-[#C4B5FD]" aria-hidden="true" />
                      {formatUtcDate(comp.starts_at)} – {formatUtcDate(comp.ends_at)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8E8EA6]">{comp.timezone}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8E8EA6]">Theme &amp; Eligibility</p>
                    <p className="mt-1 text-sm text-white">{comp.theme ?? 'No theme restriction'}</p>
                    <p className="mt-0.5 text-xs text-[#B8B8CA]">{comp.eligibility_policy}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8E8EA6]">Rules &amp; Policy Notes</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#B8B8CA]">
                      {comp.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
