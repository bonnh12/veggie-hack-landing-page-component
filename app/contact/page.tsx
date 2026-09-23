import type { Metadata } from "next"
import { ContactForm } from "@/components/veggiehack/contact-form"
import { LegalShell } from "@/components/veggiehack/legal-shell"

export const metadata: Metadata = {
  title: "Contact Us — VeggieHack",
  description: "Reach VeggieHack support for waitlist, privacy requests, and product questions.",
}

export default function ContactPage() {
  return (
    <LegalShell
      eyebrow="Support"
      title="Contact Us"
      lede="US waitlist, privacy, and product questions land here. Metrics on the right are launch placeholders so you can see how support volume will be reported."
      wide
    >
      <ContactForm />
    </LegalShell>
  )
}
