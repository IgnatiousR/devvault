import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-(--spacing-container-max) mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your usage statistics.
          </p>
        </div>
        
        <ProfileContent />
      </div>
    </main>
  )
}