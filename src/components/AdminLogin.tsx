import { useState } from "react";
import { Lock, ArrowRight, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface AdminLoginProps {
  onLogin: () => void;
}

// Simple hash function for front-end password storage
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

const DEFAULT_HASH = simpleHash("admin123");

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changeMsg, setChangeMsg] = useState("");
  const [storedHash, setStoredHash] = useLocalStorage("admin_password_hash", DEFAULT_HASH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (simpleHash(password) === storedHash) {
        sessionStorage.setItem("admin_authenticated", "true");
        onLogin();
      } else {
        setError("Senha incorreta. Tente novamente.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMsg("");

    if (simpleHash(currentPw) !== storedHash) {
      setChangeMsg("Senha atual incorreta.");
      return;
    }
    if (newPw.length < 4) {
      setChangeMsg("Nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (newPw !== confirmPw) {
      setChangeMsg("As senhas não coincidem.");
      return;
    }

    setStoredHash(simpleHash(newPw));
    setChangeMsg("Senha alterada com sucesso!");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setShowChangePassword(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-bg)' }}>
      <div className="glass-card w-full max-w-md animate-float-in">
        {!showChangePassword ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-2 text-center">
                Digite a senha para acessar o painel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isLoading ? (
                  "Verificando..."
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <button
              onClick={() => setShowChangePassword(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Alterar senha
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Alterar Senha</h1>
              <p className="text-muted-foreground mt-2 text-center">
                Digite a senha atual e a nova senha
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                type="password"
                placeholder="Senha atual"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Input
                type="password"
                placeholder="Nova senha"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />

              {changeMsg && (
                <p className={`text-sm ${changeMsg.includes("sucesso") ? "text-green-400" : "text-destructive"}`}>
                  {changeMsg}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Salvar nova senha
              </Button>

              <button
                type="button"
                onClick={() => { setShowChangePassword(false); setChangeMsg(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar ao login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
