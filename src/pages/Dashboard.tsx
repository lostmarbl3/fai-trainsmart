import { useAuth } from '@/hooks/useAuth'
import { TrainerDashboard } from '@/components/dashboard/TrainerDashboard'
import { SoloDashboard } from '@/components/dashboard/SoloDashboard'
import { ClientDashboard } from '@/components/dashboard/ClientDashboard'

export default function Dashboard() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-muted-foreground">
          Please refresh the page or contact support if this issue persists.
        </p>
      </div>
    )
  }

  switch (profile.role) {
    case 'trainer':
      return <TrainerDashboard profile={profile} />
    case 'solo':
      return <SoloDashboard profile={profile} />
    case 'client':
      return <ClientDashboard profile={profile} />
    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Unknown Role</h2>
          <p className="text-muted-foreground">
            Your account role is not recognized. Please contact support.
          </p>
        </div>
      )
  }
}