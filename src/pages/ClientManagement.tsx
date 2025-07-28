import { useState, useEffect } from 'react'
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
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

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
  const { user, profile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  // Load clients on component mount
  useEffect(() => {
    if (user && profile?.role === 'trainer') {
      loadClients()
    }
  }, [user, profile])

  const loadClients = async () => {
    try {
      setLoading(true)
      console.log('Loading clients for trainer:', user?.id)

      const { data, error } = await supabase
        .from('trainer_clients')
        .select(`
          *,
          client:profiles!trainer_clients_client_id_fkey(*)
        `)
        .eq('trainer_id', user?.id)

      if (error) {
        console.error('Error loading clients:', error)
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive"
        })
        return
      }

      if (data) {
        console.log('Loaded client data:', data)
        const clientsList = data.map(tc => ({
          id: tc.client_id,
          first_name: tc.client?.first_name || '',
          last_name: tc.client?.last_name || '',
          email: tc.client?.email || '',
          phone: '', // Phone not stored in profiles, will be empty for now
          status: tc.status as 'active' | 'suspended' | 'pending',
          billing_amount: tc.billing_amount ? Number(tc.billing_amount) : undefined,
          billing_schedule: tc.billing_schedule || '',
          trainer_notes: tc.trainer_notes || '',
          requires_waiver: tc.requires_waiver || false,
          waiver_signed_at: tc.waiver_signed_at || undefined,
          requires_health_questionnaire: tc.requires_health_questionnaire || false,
          health_questionnaire_completed_at: tc.health_questionnaire_completed_at || undefined,
          created_at: tc.created_at || new Date().toISOString()
        }))
        setClients(clientsList)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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

  const addClient = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add clients",
        variant: "destructive"
      })
      return
    }

    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      console.log('Adding new client:', newClient)

      // First, create or find the user profile for the client
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newClient.email)
        .single()

      let clientId: string

      if (existingProfile) {
        // Client already exists as a user
        clientId = existingProfile.id
        console.log('Found existing client profile:', existingProfile)
      } else {
        // Create a new profile for the client
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            email: newClient.email,
            first_name: newClient.first_name,
            last_name: newClient.last_name,
            role: 'client',
            user_id: null // Set to null since they haven't signed up yet
          })
          .select()
          .single()

        if (createProfileError) {
          console.error('Error creating client profile:', createProfileError)
          toast({
            title: "Error",
            description: "Failed to create client profile",
            variant: "destructive"
          })
          return
        }

        clientId = newProfile.id
        console.log('Created new client profile:', newProfile)
      }

      // Now create the trainer-client relationship
      const { data: trainerClient, error: relationshipError } = await supabase
        .from('trainer_clients')
        .insert({
          trainer_id: user.id,
          client_id: clientId,
          status: 'pending',
          billing_amount: newClient.billing_amount ? parseFloat(newClient.billing_amount) : null,
          billing_schedule: newClient.billing_schedule,
          requires_waiver: newClient.requires_waiver,
          requires_health_questionnaire: newClient.requires_health_questionnaire,
          days_past_due_limit: parseInt(newClient.days_past_due_limit) || 7,
          trainer_notes: newClient.training_goals || null
        })
        .select()
        .single()

      if (relationshipError) {
        console.error('Error creating trainer-client relationship:', relationshipError)
        toast({
          title: "Error",
          description: "Failed to add client to your list",
          variant: "destructive"
        })
        return
      }

      console.log('Created trainer-client relationship:', trainerClient)

      // Refresh the clients list
      await loadClients()
      
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
        title: "Success",
        description: `${newClient.first_name} ${newClient.last_name} has been added to your client list.`,
      })
    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const createWorkoutForClient = (clientId: string) => {
    navigate(`/workout-builder?assignTo=${clientId}`)
  }

  const viewClientProfile = (clientId: string) => {
    navigate(`/profile`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center">Loading clients...</div>
      </div>
    )
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