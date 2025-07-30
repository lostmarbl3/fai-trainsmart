
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ParsedExercise {
  name: string
  sets?: string
  reps?: string
  rpe?: string
  rest?: string
}

export default function WorkoutBuilderAI() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedExercise[]>([])
  const [loading, setLoading] = useState(false)

  const simulateAIParsing = (text: string): ParsedExercise[] => {
    const lines = text.split('\n').filter(Boolean)
    return lines.map(line => {
      const match = line.match(/(.*?)(\d+x\d+)?\s?(RPE\s?\d+)?\s?(rest\s?.*)?/i)
      return {
        name: match?.[1]?.trim() || '',
        sets: match?.[2] || '',
        rpe: match?.[3] || '',
        rest: match?.[4] || ''
      }
    })
  }

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      const result = simulateAIParsing(input)
      setParsed(result)
      setLoading(false)
    }, 1000)
  }

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>AI Workout Builder (Text Input)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Back squat 3x8 RPE 7 rest 90 sec..."
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Parsing...' : 'Parse Workout'}
        </Button>
        {parsed.length > 0 && (
          <div className="space-y-3">
            {parsed.map((ex, i) => (
              <div key={i} className="p-3 border rounded-md bg-muted text-muted-foreground">
                <strong>{ex.name}</strong> {ex.sets && `| ${ex.sets}`} {ex.rpe && `| ${ex.rpe}`} {ex.rest && `| ${ex.rest}`}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
