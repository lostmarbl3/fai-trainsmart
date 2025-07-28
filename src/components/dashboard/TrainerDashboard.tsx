import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Users, 
  Calendar, 
  AlertCircle, 
  FileText,
  Activity,
  TrendingUp
} from 'lucide-react'

interface DashboardTile {
  id: string
  title: string
  content: React.ReactNode
  className?: string
}

interface TrainerDashboardProps {
  profile: any
}

export function TrainerDashboard({ profile }: TrainerDashboardProps) {
  const [clients, setClients] = useState<any[]>([])
  const [todaysWorkouts, setTodaysWorkouts] = useState<any[]>([])
  const [draftWorkouts, setDraftWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
  }, [profile?.id])

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch clients
      const { data: clientsData } = await supabase
        .from('trainer_clients')
        .select(`
          *,
          client:profiles!trainer_clients_client_id_fkey(id, first_name, last_name, email)
        `)
        .eq('trainer_id', profile?.id)

      // Fetch today's workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select(`
          *,
          assigned_user:profiles!workouts_assigned_to_fkey(first_name, last_name)
        `)
        .eq('creator_id', profile?.id)
        .eq('scheduled_date', today)
        .eq('status', 'assigned')

      // Fetch draft workouts
      const { data: draftsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('creator_id', profile?.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(5)

      setClients(clientsData || [])
      setTodaysWorkouts(workoutsData || [])
      setDraftWorkouts(draftsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tiles: DashboardTile[] = [
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      content: (
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/workouts/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Workout
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/programs/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/clients/add">
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      ),
    },
    {
      id: 'todays-clients',
      title: "Today's Scheduled Workouts",
      content: (
        <div className="space-y-2">
          {todaysWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts scheduled today</p>
          ) : (
            todaysWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div>
                  <p className="font-medium text-sm">{workout.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {workout.assigned_user?.first_name} {workout.assigned_user?.last_name}
                  </p>
                </div>
                <Badge variant="outline">{workout.status}</Badge>
              </div>
            ))
          )}
          {todaysWorkouts.length > 0 && (
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          )}
        </div>
      ),
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      content: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Recent client activities will appear here</p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/activity">
              <Activity className="mr-2 h-3 w-3" />
              View All Activity
            </Link>
          </Button>
        </div>
      ),
    },
    {
      id: 'client-overview',
      title: 'Client Overview',
      content: (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/clients">
              <Users className="mr-2 h-3 w-3" />
              Manage Clients
            </Link>
          </Button>
        </div>
      ),
    },
    {
      id: 'draft-workouts',
      title: 'Draft Workouts',
      content: (
        <div className="space-y-2">
          {draftWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No draft workouts</p>
          ) : (
            draftWorkouts.map((draft) => (
              <div key={draft.id} className="p-2 bg-muted rounded">
                <p className="font-medium text-sm">{draft.title}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(draft.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/workouts?filter=draft">
              <FileText className="mr-2 h-3 w-3" />
              View All Drafts
            </Link>
          </Button>
        </div>
      ),
    },
    {
      id: 'alerts',
      title: 'Alerts & Notifications',
      content: (
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>No alerts at this time</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Missed workouts, overdue payments, and schedule conflicts will appear here
          </p>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.first_name || 'Trainer'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your training business today.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {clients.length} Active Clients
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile) => (
          <Card key={tile.id} className={tile.className}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tile.title}</CardTitle>
            </CardHeader>
            <CardContent>{tile.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}