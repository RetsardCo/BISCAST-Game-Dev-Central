import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm font-medium text-[#C4B5FD]">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#B8B8CA]">
        The route you requested does not exist in BISCAST Game Dev Central, or the project record
        may have been archived or unpublished.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to="/">Return Home</ButtonLink>
        <ButtonLink to="/games" variant="secondary">
          Explore Games
        </ButtonLink>
      </div>
    </div>
  );
}
