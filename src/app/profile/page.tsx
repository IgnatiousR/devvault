import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your usage statistics.
        </p>
      </div>

      <ProfileContent />
    </>
  )
}