type Translations = Record<string, Record<string, string>>;

export const translations: Translations = {
  pt: {
    "footer.madeWith": "Feito com ❤️ usando Bio Link",
    "share.copy": "Copiar",
    "share.copied": "Copiado!",
    "share.qrcode": "QR Code",
    "share.send": "Enviar",
    "share.qrTitle": "QR Code",
    "share.qrDescription": "Escaneie para acessar a página",
    "share.copyLink": "Copiar link",
    "share.linkCopied": "Link copiado!",
    "toast.copied": "Link copiado!",
    "toast.copyError": "Não foi possível copiar o link",
  },
  en: {
    "footer.madeWith": "Made with ❤️ using Bio Link",
    "share.copy": "Copy",
    "share.copied": "Copied!",
    "share.qrcode": "QR Code",
    "share.send": "Share",
    "share.qrTitle": "QR Code",
    "share.qrDescription": "Scan to access the page",
    "share.copyLink": "Copy link",
    "share.linkCopied": "Link copied!",
    "toast.copied": "Link copied!",
    "toast.copyError": "Could not copy the link",
  },
};

export type Language = "pt" | "en";

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations.pt[key] || key;
}
