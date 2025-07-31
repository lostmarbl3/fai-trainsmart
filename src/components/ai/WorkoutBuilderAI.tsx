import { useState } from 'react';

const WorkoutBuilderAI = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setResult(data.workout || 'No workout returned');
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded-lg shadow text-sm bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-semibold mb-3">AI Workout Generator</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="w-full p-2 rounded border bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none"
        placeholder="Describe your workout goal, experience level, and equipment (e.g. 'Build muscle, intermediate, with dumbbells')"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
      >
        {loading ? 'Generating...' : 'Generate Workout'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-800 rounded">
          <strong>Generated Workout:</strong>
          <p>{result}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-800 rounded text-red-800 dark:text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilderAI;
