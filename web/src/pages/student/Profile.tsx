import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  Trophy,
  Target,
  Activity,
  Clock
} from 'lucide-react';
import { useState } from 'react';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - would come from API
  const [userProfile, setUserProfile] = useState({
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+55 (61) 99999-1111',
    dateOfBirth: '1995-06-15',
    memberSince: '2023-03-10',
    emergencyContact: {
      name: 'Maria Silva',
      phone: '+55 (61) 99999-2222',
      relationship: 'Esposa'
    },
    preferences: {
      sports: ['Beach Tennis', 'FTV'],
      level: 'intermediario',
      goals: 'Melhorar condicionamento físico e técnica'
    },
    subscription: {
      plan: 'Fit Plus',
      status: 'active',
      nextPayment: '2024-02-15'
    }
  });

  const activityStats = {
    totalBookings: 45,
    totalClasses: 12,
    totalTrainingSessions: 8,
    monthlyGoal: 20,
    currentMonthActivities: 15
  };

  const recentActivity = [
    {
      id: '1',
      type: 'booking',
      description: 'Reserva Quadra Alecrim - Beach Tennis',
      date: '2024-01-25T19:00:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'class',
      description: 'Beach Tennis Iniciante',
      date: '2024-01-24T18:00:00Z',
      status: 'completed'
    },
    {
      id: '3',
      type: 'training',
      description: 'Personal Training - Prof. Carlos',
      date: '2024-01-22T16:00:00Z',
      status: 'completed'
    }
  ];

  const handleSave = () => {
    // Here you would save to API
    setIsEditing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'class': return Trophy;
      case 'training': return Target;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-white/80">Gerencie suas informações pessoais e preferências</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="bg-fitway-green hover:bg-fitway-green/90 text-white"
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-fitway-green" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/70">Nome Completo</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-white/70">Telefone</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-white/70">Data de Nascimento</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={userProfile.dateOfBirth}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goals" className="text-white/70">Objetivos e Metas</Label>
                  <Textarea
                    id="goals"
                    value={userProfile.preferences.goals}
                    disabled={!isEditing}
                    onChange={(e) => setUserProfile({
                      ...userProfile, 
                      preferences: {...userProfile.preferences, goals: e.target.value}
                    })}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-fitway-green" />
                  Contato de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyName" className="text-white/70">Nome</Label>
                    <Input
                      id="emergencyName"
                      value={userProfile.emergencyContact.name}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({
                        ...userProfile, 
                        emergencyContact: {...userProfile.emergencyContact, name: e.target.value}
                      })}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone" className="text-white/70">Telefone</Label>
                    <Input
                      id="emergencyPhone"
                      value={userProfile.emergencyContact.phone}
                      disabled={!isEditing}
                      onChange={(e) => setUserProfile({
                        ...userProfile, 
                        emergencyContact: {...userProfile.emergencyContact, phone: e.target.value}
                      })}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship" className="text-white/70">Parentesco</Label>
                  <Input
                    id="emergencyRelationship"
                    value={userProfile.emergencyContact.relationship}
                    disabled={!isEditing}
                    onChange={(e) => setUserProfile({
                      ...userProfile, 
                      emergencyContact: {...userProfile.emergencyContact, relationship: e.target.value}
                    })}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white text-sm">Status da Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Plano:</span>
                    <Badge variant="outline" className="border-fitway-green text-fitway-green">
                      {userProfile.subscription.plan}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Status:</span>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Próximo vencimento:</span>
                    <span className="text-white text-sm">
                      {new Date(userProfile.subscription.nextPayment).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Membro desde:</span>
                    <span className="text-white text-sm">
                      {new Date(userProfile.memberSince).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white text-sm">Estatísticas de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fitway-green">
                      {activityStats.currentMonthActivities}
                    </div>
                    <p className="text-white/70 text-sm">atividades este mês</p>
                    <div className="w-full bg-dashboard-bg rounded-full h-2 mt-2">
                      <div 
                        className="bg-fitway-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(activityStats.currentMonthActivities / activityStats.monthlyGoal) * 100}%` }}
                      />
                    </div>
                    <p className="text-white/60 text-xs mt-1">
                      Meta: {activityStats.monthlyGoal} atividades
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{activityStats.totalBookings}</div>
                      <p className="text-white/60 text-xs">Reservas</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{activityStats.totalClasses}</div>
                      <p className="text-white/60 text-xs">Aulas</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{activityStats.totalTrainingSessions}</div>
                      <p className="text-white/60 text-xs">Personal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white text-sm">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-fitway-green mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">
                            {activity.description}
                          </p>
                          <p className="text-white/60 text-xs">
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;