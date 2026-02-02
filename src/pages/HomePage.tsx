import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Bot, FileText, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';

const features = [
  {
    icon: Bot,
    title: 'Assistentes Inteligentes',
    description: 'Crie e gerencie assistentes de IA personalizados com prompts e instruções específicas.',
    href: '/assistentes',
  },
  {
    icon: FileText,
    title: 'Upload de Documentos',
    description: 'Enriqueça o conhecimento com documentos PDF, TXT e DOCX processados com embeddings vetoriais.',
    href: '/assistentes',
  },
  {
    icon: MessageSquare,
    title: 'Chat com RAG',
    description: 'Converse com seus assistentes usando busca semântica nos documentos cadastrados.',
    href: '/conversas',
  },
];

export function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 inline-block"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto glow-primary">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-gradient">RAG</span>
                <span className="text-foreground"> AI System</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Sistema de Retrieval-Augmented Generation para criar assistentes inteligentes 
                com busca semântica em seus documentos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/assistentes">
                  <Button size="lg" className="glow-subtle gap-2 w-full sm:w-auto">
                    <Sparkles className="w-5 h-5" />
                    Começar Agora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/conversas">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    <MessageSquare className="w-5 h-5" />
                    Ver Conversas
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Funcionalidades Principais
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tudo que você precisa para criar assistentes de IA poderosos com conhecimento personalizado.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={feature.href}>
                    <div className="glass-card rounded-xl p-6 h-full hover:glow-subtle transition-all group cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-border/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>RAG AI System • Desenvolvido com React + TypeScript</p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
