import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">Schedule and view your workouts</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}