/**
 * The generic page placeholder for loading.tsx files: header, a row of tiles and a
 * list, in the CMS theme. Static markup only — no data, no session — so Next can
 * prefetch the loading state cheaply and show it the instant a link is clicked.
 */
export function PageSkeleton({ tiles = 4, rows = 5 }: { tiles?: number; rows?: number }) {
    return (
        <div aria-busy="true" aria-live="polite" className="animate-pulse">
            <span className="sr-only">Loading…</span>


            {/* Page header: eyebrow, title, description */}
            <div className="mb-10">
                <div className="h-3 w-32 rounded-full bg-sunken" />
                <div className="mt-4 h-10 w-72 max-w-full rounded-2xl bg-sunken" />
                <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-sunken" />
            </div>


            {tiles > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Array.from({ length: tiles }, (_, i) => (
                        <div key={i} className="min-h-[176px] rounded-[22px] border border-line bg-surface p-5 shadow-card">
                            <div className="h-3 w-20 rounded-full bg-sunken" />
                            <div className="mt-6 h-8 w-14 rounded-xl bg-sunken" />
                        </div>
                    ))}
                </div>
            )}


            {rows > 0 && (
                <div className={`${tiles > 0 ? 'mt-12' : ''} rounded-[22px] border border-line bg-surface p-2 shadow-card`}>
                    {Array.from({ length: rows }, (_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-3">
                            <div className="size-9 shrink-0 rounded-xl bg-sunken" />
                            <div className="h-4 flex-1 rounded-full bg-sunken" />
                            <div className="hidden h-5 w-20 rounded-full bg-sunken sm:block" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}