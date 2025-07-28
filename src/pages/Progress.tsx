import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Progress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Track your fitness progress</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Progress tracking functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}