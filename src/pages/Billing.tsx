import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your billing and payments</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Billing functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}