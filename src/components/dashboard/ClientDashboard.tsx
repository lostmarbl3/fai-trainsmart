import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Play,
  MessageSquare,
  CreditCard,
  User,
  Clock
} from 'lucide-react'

interface ClientDashboardProps {
  profile: any
}

export function ClientDashboard({ profile }: ClientDashboardProps) {
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [trainerInfo, setTrainerInfo] = useState<any>(null)
  const [billingInfo, setBillingInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
  }, [profile?.id])

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch trainer relationship
      const { data: trainerRelation } = await supabase
        .from('trainer_clients')
        .select(`
          *,
          trainer:profiles!trainer_clients_trainer_id_fkey(id, first_name, last_name, email)
        `)
        .eq('client_id', profile?.id)
        .maybeSingle()

      // Fetch today's assigned workout
      const { data: todayWorkout } = await supabase
        .from('workouts')
        .select('*')
        .eq('assigned_to', profile?.id)
        .eq('scheduled_date', today)
        .maybeSingle()

      // Fetch recent workout sessions
      const { data: recentData } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(title, description)
        `)
        .eq('user_id', profile?.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(3)

      setTrainerInfo(trainerRelation)
      setTodaysWorkout(todayWorkout)
      setRecentWorkouts(recentData || [])
      setBillingInfo(trainerRelation)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
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
            Welcome back, {profile?.first_name || 'Client'}!
          </h1>
          <p className="text-muted-foreground">
            {trainerInfo ? 
              `Training with ${trainerInfo.trainer?.first_name} ${trainerInfo.trainer?.last_name}` :
              'Your fitness journey starts here'
            }
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Client
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Workout */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Today's Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysWorkout ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{todaysWorkout.title}</h3>
                  {todaysWorkout.description && (
                    <p className="text-sm text-muted-foreground">{todaysWorkout.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Assigned by your trainer
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button asChild>
                    <Link to={`/workout-builder/${todaysWorkout.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Workout
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/workout-builder/${todaysWorkout.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No workout assigned for today</p>
                <p className="text-sm text-muted-foreground">
                  Check back later or contact your trainer
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trainer Info */}
        {trainerInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Your Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">
                    {trainerInfo.trainer?.first_name} {trainerInfo.trainer?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trainerInfo.trainer?.email}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Status */}
        {billingInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Billing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={billingInfo.status === 'active' ? 'default' : 'destructive'}>
                    {billingInfo.status || 'Active'}
                  </Badge>
                </div>
                {billingInfo.billing_schedule && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule</span>
                    <span className="text-sm capitalize">{billingInfo.billing_schedule}</span>
                  </div>
                )}
                {billingInfo.billing_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Amount</span>
                    <span className="text-sm">${billingInfo.billing_amount}</span>
                  </div>
                )}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/billing">
                    View Billing Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Workouts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No completed workouts yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your first workout to start tracking progress!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <p className="font-medium">{session.workout?.title || 'Workout'}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {new Date(session.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                ))}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/progress">View All Progress</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}