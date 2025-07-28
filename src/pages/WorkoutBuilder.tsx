import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Copy, Save, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WorkoutSet {
  type: 'warmup' | 'working' | 'dropset'
  prescribed_reps: string
  prescribed_weight: string
  prescribed_rpe: string
  rest_seconds: string
  notes: string
}

interface WorkoutExercise {
  name: string
  category: string
  sets: WorkoutSet[]
  exercise_notes: string
}

interface Workout {
  id?: string
  title: string
  description: string
  exercises: WorkoutExercise[]
  assigned_to?: string
  scheduled_date?: string
}

const exerciseLibrary = [
  { name: 'Back Squat', category: 'Lower Body' },
  { name: 'Bench Press', category: 'Upper Body' },
  { name: 'Deadlift', category: 'Lower Body' },
  { name: 'Overhead Press', category: 'Upper Body' },
  { name: 'Barbell Row', category: 'Upper Body' },
  { name: 'Pull-ups', category: 'Upper Body' },
  { name: 'Romanian Deadlift', category: 'Lower Body' },
  { name: 'Dumbbell Press', category: 'Upper Body' },
]

const mockClients = [
  { id: 'client-1', name: 'John Smith', email: 'john@example.com' },
  { id: 'client-2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'client-3', name: 'Mike Wilson', email: 'mike@example.com' },
]

export default function WorkoutBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()
  
  const [workout, setWorkout] = useState<Workout>({
    title: '',
    description: '',
    exercises: []
  })
  
  const [viewMode, setViewMode] = useState<'sheets' | 'form'>('sheets')

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      name: '',
      category: '',
      sets: [{
        type: 'working',
        prescribed_reps: '',
        prescribed_weight: '',
        prescribed_rpe: '',
        rest_seconds: '90',
        notes: ''
      }],
      exercise_notes: ''
    }
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }))
  }

  const updateExercise = (exerciseIndex: number, field: string, value: any) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => 
        index === exerciseIndex ? { ...exercise, [field]: value } : exercise
      )
    }))
  }

  const addSet = (exerciseIndex: number) => {
    const newSet: WorkoutSet = {
      type: 'working',
      prescribed_reps: '',
      prescribed_weight: '',
      prescribed_rpe: '',
      rest_seconds: '90',
      notes: ''
    }
    
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => 
        index === exerciseIndex 
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    }))
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => 
        exIndex === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) => 
                sIndex === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }))
  }

  const removeExercise = (exerciseIndex: number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== exerciseIndex)
    }))
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => 
        exIndex === exerciseIndex 
          ? { ...exercise, sets: exercise.sets.filter((_, sIndex) => sIndex !== setIndex) }
          : exercise
      )
    }))
  }

  const copyExercise = (exerciseIndex: number) => {
    const exerciseToCopy = workout.exercises[exerciseIndex]
    const copiedExercise = { ...exerciseToCopy }
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, copiedExercise]
    }))
  }

  const saveWorkout = () => {
    // Mock save functionality
    toast({
      title: "Workout Saved",
      description: "Your workout has been saved as a draft.",
    })
  }

  const assignWorkout = (clientId: string) => {
    // Mock assign functionality
    const client = mockClients.find(c => c.id === clientId)
    toast({
      title: "Workout Assigned",
      description: `Workout assigned to ${client?.name}`,
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex-1">
          <Input
            placeholder="Workout Title"
            value={workout.title}
            onChange={(e) => setWorkout(prev => ({ ...prev, title: e.target.value }))}
            className="text-xl font-semibold mb-2"
          />
          <Textarea
            placeholder="Workout description (optional)"
            value={workout.description}
            onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
            className="resize-none"
            rows={2}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'sheets' ? 'default' : 'outline'}
              onClick={() => setViewMode('sheets')}
              size="sm"
            >
              Sheets
            </Button>
            <Button
              variant={viewMode === 'form' ? 'default' : 'outline'}
              onClick={() => setViewMode('form')}
              size="sm"
            >
              Form
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveWorkout} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Select onValueChange={assignWorkout}>
              <SelectTrigger asChild>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Assign to Client
                </Button>
              </SelectTrigger>
              <SelectContent>
                {mockClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Workout Builder */}
      <div className="space-y-6">
        {viewMode === 'sheets' ? (
          // Sheets Style View
          <div className="space-y-4">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Select
                      value={exercise.name}
                      onValueChange={(value) => {
                        const selectedExercise = exerciseLibrary.find(ex => ex.name === value)
                        updateExercise(exerciseIndex, 'name', value)
                        if (selectedExercise) {
                          updateExercise(exerciseIndex, 'category', selectedExercise.category)
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseLibrary.map(ex => (
                          <SelectItem key={ex.name} value={ex.name}>
                            {ex.name} ({ex.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyExercise(exerciseIndex)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => removeExercise(exerciseIndex)}
                        variant="outline" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Set</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Reps</th>
                          <th className="text-left p-2">Weight</th>
                          <th className="text-left p-2">RPE</th>
                          <th className="text-left p-2">Rest (s)</th>
                          <th className="text-left p-2">Notes</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.sets.map((set, setIndex) => (
                          <tr key={setIndex} className="border-b">
                            <td className="p-2">{setIndex + 1}</td>
                            <td className="p-2">
                              <Select
                                value={set.type}
                                onValueChange={(value) => updateSet(exerciseIndex, setIndex, 'type', value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="warmup">Warmup</SelectItem>
                                  <SelectItem value="working">Working</SelectItem>
                                  <SelectItem value="dropset">Dropset</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.prescribed_reps}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_reps', e.target.value)}
                                placeholder="8-10"
                                className="w-16"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.prescribed_weight}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_weight', e.target.value)}
                                placeholder="185"
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.prescribed_rpe}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_rpe', e.target.value)}
                                placeholder="7"
                                className="w-16"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.rest_seconds}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'rest_seconds', e.target.value)}
                                placeholder="90"
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.notes}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'notes', e.target.value)}
                                placeholder="Notes"
                                className="w-32"
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                onClick={() => removeSet(exerciseIndex, setIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      onClick={() => addSet(exerciseIndex)}
                      variant="outline" 
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Set
                    </Button>
                    
                    <Textarea
                      value={exercise.exercise_notes}
                      onChange={(e) => updateExercise(exerciseIndex, 'exercise_notes', e.target.value)}
                      placeholder="Exercise notes"
                      className="w-64 h-20 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Form Style View (Mobile Optimized)
          <div className="space-y-6">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Exercise {exerciseIndex + 1}</span>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyExercise(exerciseIndex)}
                        variant="outline" 
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => removeExercise(exerciseIndex)}
                        variant="outline" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Select
                    value={exercise.name}
                    onValueChange={(value) => {
                      const selectedExercise = exerciseLibrary.find(ex => ex.name === value)
                      updateExercise(exerciseIndex, 'name', value)
                      if (selectedExercise) {
                        updateExercise(exerciseIndex, 'category', selectedExercise.category)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseLibrary.map(ex => (
                        <SelectItem key={ex.name} value={ex.name}>
                          {ex.name} ({ex.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {exercise.sets.map((set, setIndex) => (
                    <Card key={setIndex} className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Set {setIndex + 1}</h4>
                          <Button
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Type</label>
                            <Select
                              value={set.type}
                              onValueChange={(value) => updateSet(exerciseIndex, setIndex, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warmup">Warmup</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="dropset">Dropset</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Reps</label>
                            <Input
                              value={set.prescribed_reps}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_reps', e.target.value)}
                              placeholder="8-10"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Weight</label>
                            <Input
                              value={set.prescribed_weight}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_weight', e.target.value)}
                              placeholder="185"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">RPE</label>
                            <Input
                              value={set.prescribed_rpe}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'prescribed_rpe', e.target.value)}
                              placeholder="7"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <label className="text-sm font-medium">Rest (seconds)</label>
                            <Input
                              value={set.rest_seconds}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'rest_seconds', e.target.value)}
                              placeholder="90"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Input
                              value={set.notes}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'notes', e.target.value)}
                              placeholder="Set notes"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    onClick={() => addSet(exerciseIndex)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                  
                  <div>
                    <label className="text-sm font-medium">Exercise Notes</label>
                    <Textarea
                      value={exercise.exercise_notes}
                      onChange={(e) => updateExercise(exerciseIndex, 'exercise_notes', e.target.value)}
                      placeholder="Exercise notes"
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Exercise Button */}
        <Button 
          onClick={addExercise}
          variant="outline" 
          className="w-full h-16 border-dashed"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Exercise
        </Button>
      </div>
    </div>
  )
}