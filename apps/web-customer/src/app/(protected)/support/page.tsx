import { getCustomerSettings } from "@/lib/data";

export default async function SupportPage() {
  const settings = await getCustomerSettings();
  return <main className="container-page py-8"><h1 className="text-3xl font-bold">Support</h1><div className="card mt-6 space-y-3">{settings.whatsappChannelUrl && <a className="button-primary w-full" href={settings.whatsappChannelUrl}>Join WhatsApp channel</a>}{settings.supportWhatsappNumber && <a className="button-outline w-full" href={`https://wa.me/${settings.supportWhatsappNumber}`}>Contact support on WhatsApp</a>}{!settings.whatsappChannelUrl && !settings.supportWhatsappNumber && <p className="text-muted">Support contact details are not configured yet.</p>}</div></main>;
}
