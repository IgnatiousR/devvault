import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Envelope, ShieldCheck } from "@phosphor-icons/react"

interface ProfileUserInfoProps {
  user: {
    name: string | null
    email: string
    image: string | null
    createdAt: string
    isPro: boolean
  }
  initials: string
  creationDate: string
}

export function ProfileUserInfo({ user, initials, creationDate }: ProfileUserInfoProps) {
  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
          <AvatarFallback className="text-2xl font-semibold bg-muted">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {user.name || "No name set"}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mb-2">
            <Envelope className="w-4 h-4" />
            {user.email}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Member since {creationDate}
          </p>
        </div>
        
        {user.isPro && (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-red/10 text-brand-red rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Pro</span>
          </div>
        )}
      </div>
    </section>
  )
}
