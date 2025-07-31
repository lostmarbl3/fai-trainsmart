import WorkoutBuilderAI from "../components/ai/WorkoutBuilderAI";
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Copy, Save, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

const WorkoutBuilder = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", rest: "" }
  ])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", rest: "" }])
  }

  const updateExercise = (index: number, field: string, value: string) => {
    const updated = [...exercises]
    // @ts-ignore
    updated[index][field] = value
    setExercises(updated)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Workout Builder</h1>

      <Input
        type="text"
        placeholder="Workout Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      <Textarea
        placeholder="Optional description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-6"
      />

      {exercises.map((exercise, i) => (
        <Card key={i} className="mb-4">
          <CardHeader>
            <CardTitle>Exercise {i + 1}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Name"
              value={exercise.name}
              onChange={(e) => updateExercise(i, "name", e.target.value)}
            />
            <Input
              type="text"
              placeholder="Sets"
              value={exercise.sets}
              onChange={(e) => updateExercise(i, "sets", e.target.value)}
            />
            <Input
              type="text"
              placeholder="Reps"
              value={exercise.reps}
              onChange={(e) => updateExercise(i, "reps", e.target.value)}
            />
            <Input
              type="text"
              placeholder="Rest (sec)"
              value={exercise.rest}
              onChange={(e) => updateExercise(i, "rest", e.target.value)}
            />
          </CardContent>
        </Card>
      ))}

      {/* Add Exercise Button */}
      <Button
        onClick={addExercise}
        variant="outline"
        className="w-full h-16 border-dashed"
      >
        <Plus className="h-6 w-6 mr-2" />
        Add Exercise
      </Button>

      <hr className="my-10" />

      {/* 💡 Gemini AI Workout Generator */}
      <WorkoutBuilderAI />
    </div>
  )
}

export default WorkoutBuilder;
