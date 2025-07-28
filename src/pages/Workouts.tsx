import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Workouts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Workouts</h1>
        <p className="text-muted-foreground">View and manage your assigned workouts</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your workout assignments will appear here...</p>
        </CardContent>
      </Card>
    </div>
  );
}