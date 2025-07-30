import React, { useState } from "react";

const WorkoutBuilderAI: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");

    try {
      const result = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await result.json();
      setResponse(data.output || "No response from AI.");
    } catch (err) {
      console.error(err);
      setResponse("There was an error generating your workout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">AI Workout Generator</h2>
      <textarea
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
        rows={4}
        placeholder="Describe your workout needs (e.g. 'Push day for intermediate client, 45 mins')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !prompt}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Workout"}
      </button>
      {response && (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded whitespace-pre-wrap">
          {response}
        </pre>
      )}
    </div>
  );
};

export default WorkoutBuilderAI;
