export default function CatalogSkeleton() {
    return (
        <section className="px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="h-3 w-32 rounded-full bg-white/10" />
                <div className="mt-5 h-10 w-2/3 max-w-md rounded-2xl bg-white/[0.07]" />
                <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="glass-panel aspect-[3/4] rounded-[1.75rem]" />
                            <div className="mt-4 h-3 w-1/2 rounded-full bg-white/10" />
                            <div className="mt-2 h-3 w-1/3 rounded-full bg-white/5" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}