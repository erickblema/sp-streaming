import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b09] px-4 text-center text-white">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold">Match not found</h1>
      <p className="mt-3 max-w-md text-zinc-400">
        This fixture may have been removed or the link is invalid.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-400"
      >
        Back to live matches
      </Link>
    </div>
  );
}
