interface ProfileStatsProps {
  totalItems: number
  totalCollections: number
}

export function ProfileStats({ totalItems, totalCollections }: ProfileStatsProps) {
  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Usage Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Items</p>
          <p className="text-xl font-bold text-foreground">{totalItems}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Collections</p>
          <p className="text-xl font-bold text-foreground">{totalCollections}</p>
        </div>
      </div>
    </section>
  )
}
