import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Calendar, 
  Play,
  BarChart3,
  Target,
  Clock
} from 'lucide-react'

export function SoloDashboard() {
  const { profile } = useAuth()
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [workoutStats, setWorkoutStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
  }, [profile?.id])

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Fetch today's workout
      const { data: todayWorkout } = await supabase
        .from('workouts')
        .select('*')
        .eq('creator_id', profile?.id)
        .eq('scheduled_date', today)
        .maybeSingle()

      // Fetch recent completed workouts
      const { data: recentData } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(title, description)
        `)
        .eq('user_id', profile?.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5)

      // Fetch workout statistics
      const { data: totalWorkouts } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', profile?.id)
        .not('completed_at', 'is', null)

      const { data: weekWorkouts } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', profile?.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekAgo)

      const { data: monthWorkouts } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', profile?.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', monthAgo)

      setTodaysWorkout(todayWorkout)
      setRecentWorkouts(recentData || [])
      setWorkoutStats({
        total: totalWorkouts?.length || 0,
        thisWeek: weekWorkouts?.length || 0,
        thisMonth: monthWorkouts?.length || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Ready to crush your fitness goals today?
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Solo User
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Workout */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Today's Workout
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
                </div>
                <div className="flex space-x-2">
                  <Button asChild>
                    <Link to={`/workouts/${todaysWorkout.id}/start`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Workout
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/workouts/${todaysWorkout.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No workout scheduled for today</p>
                <Button asChild>
                  <Link to="/workouts/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workout
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/workouts/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Workout
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/workouts">
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Workouts
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/progress">
                <Target className="mr-2 h-4 w-4" />
                Track Progress
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workout Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{workoutStats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-semibold">{workoutStats.thisMonth}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{workoutStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  Start tracking your fitness journey by completing your first workout!
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