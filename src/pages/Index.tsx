import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/auth/AuthForm'

const Index = () => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">F/AI</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to F/AI</h1>
        <p className="text-xl text-muted-foreground mb-4">
          {profile?.role === 'trainer' ? 'Trainer Dashboard' : 
           profile?.role === 'solo' ? 'Solo User Dashboard' : 'Dashboard'}
        </p>
        <p className="text-sm text-muted-foreground">
          Logged in as: {profile?.email} ({profile?.role})
        </p>
      </div>
    </div>
  )
};

export default Index;
