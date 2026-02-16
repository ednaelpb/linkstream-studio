import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Link2, BarChart3, Palette, Users, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Link2 className="w-4 h-4" />
            Bio Link Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
            Todos os seus links{" "}
            <span className="text-primary">em um só lugar</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Crie sua página personalizada com links, vídeos e áudios. 
            Compartilhe com o mundo em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/admin">
              <Button size="lg" className="text-base px-8 gap-2">
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-4xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {[
            { icon: Link2, title: "Links Ilimitados", desc: "Adicione links, vídeos e áudios" },
            { icon: Palette, title: "100% Customizável", desc: "Temas, cores e degradês" },
            { icon: BarChart3, title: "Analytics Completo", desc: "Cliques, dispositivos e localização" },
            { icon: Smartphone, title: "Responsivo", desc: "Perfeito em qualquer tela" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="mt-16 text-sm text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Feito com ❤️ usando Bio Link
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
