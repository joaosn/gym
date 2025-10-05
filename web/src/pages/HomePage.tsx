import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Zap, 
  Users, 
  Trophy, 
  Target,
  MessageCircle,
  Calendar,
  CreditCard,
  Instagram
} from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const HomePage = () => {
  const courts = [
    { name: 'Quadra Alecrim', location: 'Setor Alecrim' },
    { name: 'Quadra Cotafacil', location: 'Próx. Cotafacil' },
    { name: 'Quadra Castelini', location: 'Bairro Castelini' }
  ];

  const plans = [
    {
      name: 'Fit Básico',
      price: 89,
      benefits: [
        '1 reserva futura',
        'Aulas e personais à parte',
        'Desconto nas reservas',
        'Suporte prioritário'
      ]
    },
    {
      name: 'Fit Plus',
      price: 129,
      benefits: [
        '2 reservas futuras',
        '1 aula/semana incluída',
        'Desconto em personais',
        'Acesso exclusivo'
      ],
      popular: true
    }
  ];

  const classes = [
    {
      name: 'Beach Tennis Kids',
      duration: '1h',
      capacity: 6,
      level: 'Infantil'
    },
    {
      name: 'Beach Tennis Iniciante',
      duration: '1h', 
      capacity: 6,
      level: 'Iniciante'
    },
    {
      name: 'Beach Tennis Avançado',
      duration: '1h',
      capacity: 6, 
      level: 'Avançado'
    },
    {
      name: 'FTV Iniciante',
      duration: '1h',
      capacity: 6,
      level: 'Iniciante'
    },
    {
      name: 'FTV Avançado', 
      duration: '1h',
      capacity: 6,
      level: 'Avançado'
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      rating: 5,
      comment: 'Excelente estrutura e atendimento! As quadras são top e o ambiente é muito motivador.'
    },
    {
      name: 'Ana Maria',
      rating: 5,
      comment: 'Amo as aulas de Beach Tennis! Professores qualificados e horários flexíveis.'
    },
    {
      name: 'João Pedro',
      rating: 5,
      comment: 'Melhor investimento que fiz. O plano Fit Plus vale cada centavo!'
    }
  ];

  const faqs = [
    {
      question: 'Como faço uma reserva?',
      answer: 'Você pode reservar através do site ou WhatsApp. Alunos têm desconto especial!'
    },
    {
      question: 'Posso cancelar sem multa?',
      answer: 'Sim! Cancele até 6 horas antes da reserva sem qualquer cobrança.'
    },
    {
      question: 'Como funcionam os planos?',
      answer: 'Nossos planos oferecem reservas futuras e aulas incluídas com descontos especiais.'
    },
    {
      question: 'Quais formas de pagamento?',
      answer: 'Aceitamos PIX, cartão e dinheiro. PIX tem desconto de 5%!'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-fitway-dark/95 backdrop-blur-sm border-b border-fitway-green/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-fitway-green" />
            <span className="text-2xl font-bold text-white">FITWAY</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#sobre" className="text-white hover:text-fitway-green transition-colors">Sobre</a>
            <a href="#quadras" className="text-white hover:text-fitway-green transition-colors">Quadras</a>
            <a href="#planos" className="text-white hover:text-fitway-green transition-colors">Planos</a>
            <a href="#aulas" className="text-white hover:text-fitway-green transition-colors">Aulas</a>
            <a href="#contato" className="text-white hover:text-fitway-green transition-colors">Contato</a>
            <Button variant="sport" size="sm" onClick={() => window.location.href = '/login'}>
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-fitway-dark/70" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Jogue mais. <span className="text-fitway-green">Evolua mais.</span>
            <br />
            <span className="text-fitway-neon">Viva a FITWAY.</span>
          </h1>
          <p className="text-xl text-fitway-light mb-8 max-w-2xl mx-auto">
            A mais moderna arena esportiva de Douradina-PR. Quadras profissionais, aulas especializadas e muito mais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" onClick={() => window.location.href = '/reserve'}>
              <Calendar className="mr-2 h-5 w-5" />
              Reservar Quadra
            </Button>
            <Button variant="neon" size="xl" onClick={() => window.location.href = '#planos'}>
              <CreditCard className="mr-2 h-5 w-5" />
              Assinar Plano
            </Button>
            <Button variant="whatsapp" size="xl" onClick={() => window.open('https://wa.me/5544997161886', '_blank')}>
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-20 bg-fitway-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Sobre a FITWAY</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Somos a arena esportiva mais moderna de Douradina-PR, oferecendo infraestrutura de ponta 
              para Beach Tennis, FTV e muito mais. Nossa missão é proporcionar experiências esportivas únicas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
              <CardHeader>
                <Trophy className="h-12 w-12 text-fitway-green mx-auto mb-4" />
                <CardTitle className="text-center text-white">Excelência Esportiva</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-white/80">
                  Quadras profissionais de areia com iluminação LED e areia premium para máxima performance.
                </p>
              </CardContent>
            </Card>

            <Card className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
              <CardHeader>
                <Users className="h-12 w-12 text-fitway-green mx-auto mb-4" />
                <CardTitle className="text-center text-white">Comunidade Ativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-white/80">
                  Mais de 500 atletas praticam conosco mensalmente em um ambiente acolhedor e motivador.
                </p>
              </CardContent>
            </Card>

            <Card className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
              <CardHeader>
                <Target className="h-12 w-12 text-fitway-green mx-auto mb-4" />
                <CardTitle className="text-center text-white">Resultados Reais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-white/80">
                  Professores certificados e metodologia comprovada para você alcançar seus objetivos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quadras */}
      <section id="quadras" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Nossas Quadras</h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-8">
              <div className="text-center p-6 bg-fitway-green/10 rounded-xl border border-fitway-green/30">
                <span className="text-4xl font-bold text-fitway-green block">R$ 40/h</span>
                <p className="text-white/80 font-medium">Aluno</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-fitway-green/20">
                <span className="text-4xl font-bold text-white block">R$ 45/h</span>
                <p className="text-white/80 font-medium">Não aluno</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courts.map((court, index) => (
              <Card key={index} className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-white">
                    <MapPin className="h-5 w-5 text-fitway-green" />
                    {court.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-white/80 mb-4">{court.location}</p>
                  <Button variant="sport" className="w-full" onClick={() => window.location.href = '/reserve'}>
                    Reservar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-fitway-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nossos Planos</h2>
            <p className="text-xl text-white/90">Escolha o plano ideal para seu estilo de vida esportivo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`sport-card bg-card/90 backdrop-blur-sm relative ${plan.popular ? 'ring-2 ring-fitway-green shadow-glow' : 'border-fitway-green/30'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-fitway-green text-fitway-dark font-bold">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-center text-2xl text-white">{plan.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-fitway-green">R$ {plan.price}</span>
                    <span className="text-white/80 text-lg">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-fitway-green flex-shrink-0" />
                        <span className="text-white/90">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.popular ? "neon" : "sport"} className="w-full" size="lg">
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Aulas */}
      <section id="aulas" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nossas Aulas</h2>
            <p className="text-xl text-white/90">Aulas especializadas com professores certificados</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem, index) => (
              <Card key={index} className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{classItem.name}</CardTitle>
                  <Badge variant="outline" className="w-fit border-fitway-green text-fitway-green">
                    {classItem.level}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/80">{classItem.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/80">{classItem.capacity} vagas</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                    Ver Horários
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-fitway-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">O que dizem nossos atletas</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{testimonial.name}</CardTitle>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-fitway-green text-fitway-green" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section id="contato" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">Localização & Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-fitway-green mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Endereço</h3>
                    <p className="text-white/80">Rua do Esporte, 123<br />Centro - Douradina/PR</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-fitway-green mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Telefone</h3>
                    <p className="text-white/80">(44) 99716-1886</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-fitway-green mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Horários</h3>
                    <p className="text-white/80">
                      Seg - Sex: 06:00 - 23:00<br />
                      Sáb - Dom: 07:00 - 22:00
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Instagram className="h-6 w-6 text-fitway-green mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Instagram</h3>
                    <p className="text-white/80">@fitway_douradina</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-fitway-light/50 border border-fitway-green/30 rounded-lg h-96 flex items-center justify-center">
              <p className="text-white/70">Mapa do Google será carregado aqui</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-fitway-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fitway-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-8 w-8 text-fitway-green" />
                <span className="text-2xl font-bold text-white">FITWAY</span>
              </div>
              <p className="text-white/80">
                A mais moderna arena esportiva de Douradina-PR.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-fitway-green">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="/reserve" className="text-white/80 hover:text-fitway-green transition-colors">Reservar Quadra</a></li>
                <li><a href="#planos" className="text-white/80 hover:text-fitway-green transition-colors">Planos</a></li>
                <li><a href="#aulas" className="text-white/80 hover:text-fitway-green transition-colors">Aulas</a></li>
                <li><a href="/login" className="text-white/80 hover:text-fitway-green transition-colors">Área do Aluno</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-fitway-green">Contato</h3>
              <ul className="space-y-2 text-white/80">
                <li>(44) 99716-1886</li>
                <li>contato@fitway.com.br</li>
                <li>Rua do Esporte, 123</li>
                <li>Douradina/PR</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-fitway-green">Horários</h3>
              <ul className="space-y-2 text-white/80">
                <li>Seg - Sex: 06:00 - 23:00</li>
                <li>Sáb - Dom: 07:00 - 22:00</li>
              </ul>
              
              <div className="mt-6">
                <Button variant="whatsapp" onClick={() => window.open('https://wa.me/5544997161886', '_blank')}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-fitway-green/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 FITWAY. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;