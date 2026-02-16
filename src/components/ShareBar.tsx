import { useState, useCallback } from "react";
import { Copy, Check, QrCode, Share2, X } from "lucide-react";
import { toast } from "sonner";

interface ShareBarProps {
  brandName: string;
}

export function ShareBar({ brandName }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const pageUrl = window.location.href;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }, [pageUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brandName,
          url: pageUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }, [brandName, pageUrl, handleCopy]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}&bgcolor=1a1a2e&color=22d3ee&format=svg`;

  return (
    <>
      <div className="flex items-center justify-center gap-3 animate-float-in-delay-3">
        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all duration-200 text-sm font-medium"
          title="Copiar link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? "Copiado!" : "Copiar"}</span>
        </button>

        {/* QR Code */}
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all duration-200 text-sm font-medium"
          title="QR Code"
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code</span>
        </button>

        {/* Native Share (mobile) */}
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all duration-200 text-sm font-medium"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
          <span>Enviar</span>
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-float-in"
          onClick={() => setShowQR(false)}
        >
          <div
            className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-xs w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-foreground text-center mb-1">
              QR Code
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Escaneie para acessar a página
            </p>
            <div className="flex justify-center rounded-xl overflow-hidden bg-white p-4">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48"
                loading="lazy"
              />
            </div>
            <button
              onClick={handleCopy}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link copiado!" : "Copiar link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
