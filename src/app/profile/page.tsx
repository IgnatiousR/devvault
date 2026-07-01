import Link from "next/link"
import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and view your usage statistics.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <ProfileContent />
    </>
  )
}