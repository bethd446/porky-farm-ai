import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileFarm } from "@/components/profile/profile-farm"
import { ProfileSettings } from "@/components/profile/profile-settings"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <ProfileStats />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileFarm />
        <ProfileSettings />
      </div>
    </div>
  )
}
