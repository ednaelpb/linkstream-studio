import { useState } from "react";
import { Lock, ArrowRight, KeyRound, Mail, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onLogin: () => void;
}

type View = "login" | "signup" | "forgot";

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<View>("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    } else {
      onLogin();
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Conta criada com sucesso! Faça login.");
      setView("login");
      setPassword("");
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="glass-card w-full max-w-md animate-float-in">
        {view === "login" && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-2 text-center">
                Entre com seu e-mail e senha
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />

              {error && <p className="text-destructive text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Entrando..." : (<>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>)}
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => { setView("forgot"); setError(""); setMessage(""); }} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <KeyRound className="w-3.5 h-3.5" /> Esqueci minha senha
              </button>
              <button onClick={() => { setView("signup"); setError(""); setMessage(""); }} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <UserPlus className="w-3.5 h-3.5" /> Criar conta
              </button>
            </div>
          </>
        )}

        {view === "signup" && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Criar Conta</h1>
              <p className="text-muted-foreground mt-2 text-center">Crie sua conta de administrador</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground" required />
              <Input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground" required />

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Criando..." : "Criar Conta"}
              </Button>

              <button type="button" onClick={() => { setView("login"); setError(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Voltar ao login
              </button>
            </form>
          </>
        )}

        {view === "forgot" && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Recuperar Senha</h1>
              <p className="text-muted-foreground mt-2 text-center">Enviaremos um link para redefinir sua senha</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground" required />

              {error && <p className="text-destructive text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}

              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Enviando..." : "Enviar Link"}
              </Button>

              <button type="button" onClick={() => { setView("login"); setError(""); setMessage(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
