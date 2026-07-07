import { getColorBgAlphaClass, getColorTextClass } from "@/lib/color-utils"

interface ItemType {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

interface ProfileItemTypesProps {
  itemTypes: ItemType[]
}

export function ProfileItemTypes({ itemTypes }: ProfileItemTypesProps) {
  if (itemTypes.length === 0) return null

  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Items by Type</h2>
      <div className="space-y-3">
        {itemTypes.map((itemType) => (
          <div
            key={itemType.id}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded flex items-center justify-center ${getColorBgAlphaClass(itemType.color)}`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${getColorTextClass(itemType.color)}`}
                >
                  {itemType.icon}
                </span>
              </div>
              <span className="font-medium text-foreground">{itemType.name}</span>
            </div>
            <span className="text-muted-foreground font-medium">{itemType.count}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
