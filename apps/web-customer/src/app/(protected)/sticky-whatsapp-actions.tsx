import type { CustomerSettings } from "@/lib/data";

export default function StickyWhatsappActions({ settings }: { settings: CustomerSettings }) {
  const channelHref = settings.whatsappChannelUrl || "/support";
  const supportHref = settings.supportWhatsappNumber ? `https://wa.me/${settings.supportWhatsappNumber}` : "/support";
  const whatsappIcon = <svg aria-hidden="true" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a9.9 9.9 0 0 0-8.6 14.8L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.9 12l-.3.5.8 2.8-2.8-.7-.5.3A8 8 0 1 1 12 4Zm-4.1 3.8c.2-.2.5-.2.8-.2l1.5.7c.3.1.4.3.5.6l.4 1.1c.1.3 0 .6-.2.8l-.6.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6c.2-.2.5-.3.8-.2l1.1.4c.3.1.5.3.6.5l.7 1.5c.1.3 0 .6-.2.8l-.5.5c-.5.5-1.2.7-1.9.5-3.1-.9-5.7-3.5-6.6-6.6-.2-.7 0-1.4.5-1.9l.5-.5Z" /></svg>;

  return <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-end justify-between px-3 sm:px-5">
    <a className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:px-4 sm:text-sm" href={channelHref} target={settings.whatsappChannelUrl ? "_blank" : undefined} rel={settings.whatsappChannelUrl ? "noreferrer" : undefined}>{whatsappIcon}<span>WhatsApp channel</span></a>
    <a className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:px-4 sm:text-sm" href={supportHref} target={settings.supportWhatsappNumber ? "_blank" : undefined} rel={settings.supportWhatsappNumber ? "noreferrer" : undefined}>{whatsappIcon}<span>WhatsApp support</span></a>
  </div>;
}
