import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Search, Calendar, User, DollarSign, FileText, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  status: 'active' | 'suspended' | 'pending'
  last_workout?: string
  next_scheduled?: string
  billing_amount?: number
  billing_schedule?: string
  trainer_notes?: string
  requires_waiver: boolean
  waiver_signed_at?: string
  requires_health_questionnaire: boolean
  health_questionnaire_completed_at?: string
  created_at: string
}

// Mock client data
const mockClients: Client[] = [
  {
    id: 'client-1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    last_workout: '2024-01-20',
    next_scheduled: '2024-01-22',
    billing_amount: 150,
    billing_schedule: 'monthly',
    requires_waiver: true,
    waiver_signed_at: '2024-01-15T10:00:00Z',
    requires_health_questionnaire: true,
    health_questionnaire_completed_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    id: 'client-2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@example.com',
    phone: '(555) 234-5678',
    status: 'active',
    last_workout: '2024-01-19',
    next_scheduled: '2024-01-23',
    billing_amount: 200,
    billing_schedule: 'monthly',
    requires_waiver: true,
    requires_health_questionnaire: false,
    created_at: '2024-01-10T14:00:00Z'
  },
  {
    id: 'client-3',
    first_name: 'Mike',
    last_name: 'Wilson',
    email: 'mike@example.com',
    status: 'pending',
    billing_amount: 120,
    billing_schedule: 'weekly',
    requires_waiver: true,
    requires_health_questionnaire: true,
    created_at: '2024-01-21T16:00:00Z'
  }
]

export default function ClientManagement() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  // New client form state
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    billing_amount: '',
    billing_schedule: 'monthly',
    requires_waiver: false,
    waiver_link: '',
    requires_health_questionnaire: false,
    health_questionnaire_link: '',
    days_past_due_limit: '7',
    training_goals: ''
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const addClient = () => {
    const client: Client = {
      id: `client-${Date.now()}`,
      first_name: newClient.first_name,
      last_name: newClient.last_name,
      email: newClient.email,
      phone: newClient.phone || undefined,
      status: 'pending',
      billing_amount: newClient.billing_amount ? parseFloat(newClient.billing_amount) : undefined,
      billing_schedule: newClient.billing_schedule,
      requires_waiver: newClient.requires_waiver,
      requires_health_questionnaire: newClient.requires_health_questionnaire,
      created_at: new Date().toISOString()
    }

    setClients(prev => [...prev, client])
    setIsAddClientOpen(false)
    
    // Reset form
    setNewClient({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      billing_amount: '',
      billing_schedule: 'monthly',
      requires_waiver: false,
      waiver_link: '',
      requires_health_questionnaire: false,
      health_questionnaire_link: '',
      days_past_due_limit: '7',
      training_goals: ''
    })

    toast({
      title: "Client Added",
      description: `${client.first_name} ${client.last_name} has been added to your client list.`,
    })
  }

  const createWorkoutForClient = (clientId: string) => {
    navigate(`/workout-builder?assignTo=${clientId}`)
  }

  const viewClientProfile = (clientId: string) => {
    navigate(`/profile`)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Manage your clients and their training programs</p>
        </div>
        
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={newClient.first_name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={newClient.last_name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Requirements Setup */}
              <div className="space-y-4">
                <h3 className="font-semibold">Requirements</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requires_waiver"
                      checked={newClient.requires_waiver}
                      onCheckedChange={(checked) => 
                        setNewClient(prev => ({ ...prev, requires_waiver: checked as boolean }))
                      }
                    />
                    <Label htmlFor="requires_waiver">Liability Waiver Required</Label>
                  </div>
                  
                  {newClient.requires_waiver && (
                    <div className="ml-6">
                      <Label htmlFor="waiver_link">Waiver PDF Link or External Link</Label>
                      <Input
                        id="waiver_link"
                        value={newClient.waiver_link}
                        onChange={(e) => setNewClient(prev => ({ ...prev, waiver_link: e.target.value }))}
                        placeholder="https://example.com/waiver.pdf"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requires_health_questionnaire"
                      checked={newClient.requires_health_questionnaire}
                      onCheckedChange={(checked) => 
                        setNewClient(prev => ({ ...prev, requires_health_questionnaire: checked as boolean }))
                      }
                    />
                    <Label htmlFor="requires_health_questionnaire">Health Questionnaire Required</Label>
                  </div>
                  
                  {newClient.requires_health_questionnaire && (
                    <div className="ml-6">
                      <Label htmlFor="health_questionnaire_link">Health Questionnaire PDF Link</Label>
                      <Input
                        id="health_questionnaire_link"
                        value={newClient.health_questionnaire_link}
                        onChange={(e) => setNewClient(prev => ({ ...prev, health_questionnaire_link: e.target.value }))}
                        placeholder="https://example.com/health-questionnaire.pdf"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Setup */}
              <div className="space-y-4">
                <h3 className="font-semibold">Billing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billing_amount">Amount ($)</Label>
                    <Input
                      id="billing_amount"
                      type="number"
                      value={newClient.billing_amount}
                      onChange={(e) => setNewClient(prev => ({ ...prev, billing_amount: e.target.value }))}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_schedule">Schedule</Label>
                    <Select
                      value={newClient.billing_schedule}
                      onValueChange={(value) => setNewClient(prev => ({ ...prev, billing_schedule: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="per-session">Per Session</SelectItem>
                        <SelectItem value="external">External Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="days_past_due_limit">Days Past Due Limit</Label>
                  <Input
                    id="days_past_due_limit"
                    type="number"
                    value={newClient.days_past_due_limit}
                    onChange={(e) => setNewClient(prev => ({ ...prev, days_past_due_limit: e.target.value }))}
                    placeholder="7"
                  />
                </div>
              </div>

              {/* Training Goals */}
              <div className="space-y-4">
                <h3 className="font-semibold">Training Information</h3>
                <div>
                  <Label htmlFor="training_goals">Training Goals</Label>
                  <Textarea
                    id="training_goals"
                    value={newClient.training_goals}
                    onChange={(e) => setNewClient(prev => ({ ...prev, training_goals: e.target.value }))}
                    placeholder="Weight loss, strength building, marathon training..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addClient}
                  disabled={!newClient.first_name || !newClient.last_name || !newClient.email}
                >
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client List */}
      <div className="grid gap-6">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No clients found</p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">
                          {client.first_name} {client.last_name}
                        </h3>
                        {getStatusBadge(client.status)}
                      </div>
                      <p className="text-muted-foreground">{client.email}</p>
                      {client.phone && (
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {client.last_workout && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                        </div>
                        <p className="text-sm font-medium">Last Workout</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(client.last_workout).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {client.next_scheduled && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="h-4 w-4 text-primary mr-1" />
                        </div>
                        <p className="text-sm font-medium">Next Scheduled</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(client.next_scheduled).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {client.billing_amount && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        </div>
                        <p className="text-sm font-medium">${client.billing_amount}</p>
                        <p className="text-xs text-muted-foreground">{client.billing_schedule}</p>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                      </div>
                      <p className="text-sm font-medium">Requirements</p>
                      <div className="flex justify-center gap-1">
                        {client.requires_waiver && (
                          <span className={`text-xs px-1 rounded ${
                            client.waiver_signed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            W
                          </span>
                        )}
                        {client.requires_health_questionnaire && (
                          <span className={`text-xs px-1 rounded ${
                            client.health_questionnaire_completed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            H
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-2">
                    <Button
                      onClick={() => createWorkoutForClient(client.id)}
                      size="sm"
                    >
                      Create Workout
                    </Button>
                    <Button
                      onClick={() => viewClientProfile(client.id)}
                      variant="outline"
                      size="sm"
                    >
                      View Profile
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}