import type { CustomerSettings } from "@/lib/data";

export default function StickyWhatsappActions({ settings }: { settings: CustomerSettings }) {
  const supportHref = settings.supportWhatsappNumber ? `https://wa.me/${settings.supportWhatsappNumber}` : null;

  if (!settings.whatsappChannelUrl && !supportHref) return null;

  return <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-end justify-between px-3 sm:px-5">
    {settings.whatsappChannelUrl ? <a className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:px-4 sm:text-sm" href={settings.whatsappChannelUrl} target="_blank" rel="noreferrer">WhatsApp channel</a> : <span />}
    {supportHref ? <a className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:px-4 sm:text-sm" href={supportHref} target="_blank" rel="noreferrer">WhatsApp support</a> : <span />}
  </div>;
}
