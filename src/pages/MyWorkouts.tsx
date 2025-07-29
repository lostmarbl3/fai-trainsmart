import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Calendar, User, Clock, Copy, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

interface Workout {
  id: string
  title: string
  description?: string
  status: 'draft' | 'template' | 'assigned' | 'completed'
  created_at: string
  scheduled_date?: string
  assigned_to?: string
  assigned_to_name?: string
  exercise_count: number
  estimated_duration?: number
  last_used?: string
}

// Mock workout data
const mockWorkouts: Workout[] = [
  {
    id: 'workout-1',
    title: 'Upper Body Strength',
    description: 'Compound movements focusing on push/pull patterns',
    status: 'template',
    created_at: '2024-01-15T10:00:00Z',
    exercise_count: 6,
    estimated_duration: 60,
    last_used: '2024-01-20T14:00:00Z'
  },
  {
    id: 'workout-2',
    title: 'Lower Body Power',
    description: 'Explosive movements and strength training',
    status: 'template',
    created_at: '2024-01-10T09:00:00Z',
    exercise_count: 5,
    estimated_duration: 45,
    last_used: '2024-01-18T16:00:00Z'
  },
  {
    id: 'workout-3',
    title: 'Monday Chest & Triceps',
    description: 'John Smith workout for this week',
    status: 'assigned',
    created_at: '2024-01-21T11:00:00Z',
    scheduled_date: '2024-01-22T10:00:00Z',
    assigned_to: 'client-1',
    assigned_to_name: 'John Smith',
    exercise_count: 7,
    estimated_duration: 50
  },
  {
    id: 'workout-4',
    title: 'Cardio Conditioning',
    description: 'High intensity interval training session',
    status: 'draft',
    created_at: '2024-01-20T15:30:00Z',
    exercise_count: 4,
    estimated_duration: 30
  },
  {
    id: 'workout-5',
    title: 'Full Body Beginner',
    description: 'Introductory workout for new clients',
    status: 'completed',
    created_at: '2024-01-18T12:00:00Z',
    exercise_count: 8,
    estimated_duration: 40,
    last_used: '2024-01-19T10:00:00Z'
  }
]

export default function MyWorkouts() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const isTrainer = profile?.role === 'trainer'
  const isSolo = profile?.role === 'solo'

  // Load workouts on component mount
  useEffect(() => {
    if (user) {
      loadWorkouts()
    }
  }, [user])

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      console.log('Loading workouts for user:', user?.id)

      let query = supabase
        .from('workouts')
        .select('*')

      // For trainers, load workouts they created
      // For clients/solo, load workouts assigned to them or created by them
      if (profile?.role === 'trainer') {
        query = query.eq('creator_id', user?.id)
      } else {
        query = query.or(`creator_id.eq.${user?.id},assigned_to.eq.${user?.id}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading workouts:', error)
        toast({
          title: "Error",
          description: "Failed to load workouts",
          variant: "destructive"
        })
        return
      }

      if (data) {
        console.log('Loaded workouts:', data)
        const workoutsList = data.map(w => ({
          id: w.id,
          title: w.title || '',
          description: w.description || '',
          status: w.status as 'draft' | 'template' | 'assigned' | 'completed',
          created_at: w.created_at || new Date().toISOString(),
          scheduled_date: w.scheduled_date || undefined,
          assigned_to: w.assigned_to || undefined,
          assigned_to_name: undefined, // We'll implement this later when we have proper user profiles
          exercise_count: (w.workout_data as any)?.exercises?.length || 0,
          estimated_duration: undefined, // We'll calculate this later if needed
          last_used: undefined // We'll implement this with workout sessions later
        }))
        setWorkouts(workoutsList)
      }
    } catch (error) {
      console.error('Error loading workouts:', error)
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'template':
        return <Badge className="bg-blue-100 text-blue-800">Template</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'assigned':
        return <Badge className="bg-orange-100 text-orange-800">Assigned</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filterWorkouts = (status: string[]) => {
    return workouts.filter(workout => status.includes(workout.status))
  }

  const createNewWorkout = () => {
    navigate('/workout-builder')
  }

  const editWorkout = (workoutId: string) => {
    navigate(`/workout-builder/${workoutId}`)
  }

  const copyWorkout = async (workout: Workout) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to copy workouts",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Copying workout:', workout)

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          title: `${workout.title} (Copy)`,
          description: workout.description,
          creator_id: user.id,
          workout_data: (workouts.find(w => w.id === workout.id) as any)?.workout_data || { exercises: [] },
          status: 'draft'
        })
        .select()
        .single()

      if (error) {
        console.error('Error copying workout:', error)
        toast({
          title: "Error",
          description: "Failed to copy workout",
          variant: "destructive"
        })
        return
      }

      console.log('Workout copied successfully:', data)
      await loadWorkouts() // Refresh the list

      toast({
        title: "Success",
        description: `"${workout.title}" has been copied to your drafts.`,
      })
    } catch (error) {
      console.error('Error copying workout:', error)
      toast({
        title: "Error",
        description: "Failed to copy workout",
        variant: "destructive"
      })
    }
  }

  const deleteWorkout = async (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId)
    
    try {
      console.log('Deleting workout:', workoutId)

      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) {
        console.error('Error deleting workout:', error)
        toast({
          title: "Error",
          description: "Failed to delete workout",
          variant: "destructive"
        })
        return
      }

      console.log('Workout deleted successfully')
      setWorkouts(prev => prev.filter(w => w.id !== workoutId))
      
      toast({
        title: "Success",
        description: `"${workout?.title}" has been deleted.`,
      })
    } catch (error) {
      console.error('Error deleting workout:', error)
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive"
      })
    }
  }

  const startWorkout = (workoutId: string) => {
    navigate(`/workout-builder/${workoutId}`)
  }

  const WorkoutCard = ({ workout }: { workout: Workout }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{workout.title}</CardTitle>
            {workout.description && (
              <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
            )}
            <div className="flex items-center gap-2">
              {getStatusBadge(workout.status)}
              {workout.assigned_to_name && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {workout.assigned_to_name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">{workout.exercise_count}</span>
            </div>
            <span className="text-muted-foreground">exercises</span>
          </div>
          
          {workout.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{workout.estimated_duration} min</span>
            </div>
          )}
          
          {workout.scheduled_date && (
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Scheduled: {new Date(workout.scheduled_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {workout.last_used && (
            <div className="flex items-center gap-2 col-span-2">
              <span className="text-xs text-muted-foreground">
                Last used: {new Date(workout.last_used).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {(workout.status === 'assigned' || workout.status === 'template') && (
            <Button 
              onClick={() => startWorkout(workout.id)}
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          )}
          
          <Button 
            onClick={() => editWorkout(workout.id)}
            variant="outline" 
            size="sm"
          >
            Edit
          </Button>
          
          <Button 
            onClick={() => copyWorkout(workout)}
            variant="outline" 
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          {workout.status === 'draft' && (
            <Button 
              onClick={() => deleteWorkout(workout.id)}
              variant="outline" 
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center">Loading workouts...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground">
            {isTrainer ? 'Manage your workout templates and client assignments' : 'Your personal workout library'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={createNewWorkout}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
          
          {isSolo && (
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Quick Start
            </Button>
          )}
        </div>
      </div>

      {/* Workout Tabs */}
      <Tabs defaultValue={isTrainer ? "templates" : "scheduled"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {isTrainer ? (
            <>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </>
          )}
        </TabsList>

        {isTrainer ? (
          <>
            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['template']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['template']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">No workout templates yet</p>
                      <Button onClick={createNewWorkout}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Template
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['draft']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['draft']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No draft workouts</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['assigned']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['assigned']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No assigned workouts</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['completed', 'assigned', 'template']).slice(0, 9).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="scheduled" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['assigned']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['assigned']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">No scheduled workouts</p>
                      <Button onClick={createNewWorkout}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create a Workout
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['template']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['template']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">No workout templates yet</p>
                      <Button onClick={createNewWorkout}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Template
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['completed']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['completed']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No completed workouts yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterWorkouts(['draft']).map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
                {filterWorkouts(['draft']).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No draft workouts</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}