import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Programs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Programs</h1>
        <p className="text-muted-foreground">Manage your training programs</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Training Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Program management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}