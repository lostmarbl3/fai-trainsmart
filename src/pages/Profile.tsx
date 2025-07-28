import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Profile management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}