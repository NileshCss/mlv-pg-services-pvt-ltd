export function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0F1629] border border-white/8 animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-24 bg-white/10 rounded-lg" />
            <div className="h-3 w-40 bg-white/5 rounded-lg" />
          </div>
          <div className="h-5 w-8 bg-white/10 rounded-lg" />
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full" />
        <div className="h-5 w-36 bg-amber-500/10 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 bg-white/5 rounded-xl" />
          <div className="h-8 flex-1 bg-white/5 rounded-xl" />
          <div className="h-8 w-8 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
