import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      
      toast({
        title: 'Conta criada com sucesso!',
        description: `Bem-vindo à FITWAY, ${response.user.name}!`,
      });

      // New users are typically students
      navigate('/aluno/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-fitway-green transition-colors">
            <Zap className="h-8 w-8" />
            <span className="text-3xl font-bold">FITWAY</span>
          </Link>
        </div>

        <Card className="sport-card backdrop-blur-sm bg-card/95 border-fitway-green/30">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Criar conta
            </CardTitle>
            <CardDescription className="text-center text-white/80">
              Junte-se à nossa comunidade esportiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(44) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-11 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="h-11 pr-10 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                />
              </div>

              <Button
                type="submit"
                variant="sport"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <div className="text-center">
                <p className="text-white/80">
                  Já tem uma conta?{' '}
                  <Link 
                    to="/login" 
                    className="text-fitway-green hover:text-fitway-neon font-medium transition-colors"
                  >
                    Faça login
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-white/60 hover:text-fitway-green transition-colors"
                >
                  ← Voltar para o site
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;