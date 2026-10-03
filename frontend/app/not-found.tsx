import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <span className="text-4xl font-extrabold text-[#1a6aef]">404</span>
        <h1 className="text-xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The procurement intelligence portal resource you requested does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1a6aef] hover:bg-blue-600 text-white text-xs font-bold transition shadow-md"
        >
          Return to Portal Home
        </Link>
      </div>
    </div>
  );
}
