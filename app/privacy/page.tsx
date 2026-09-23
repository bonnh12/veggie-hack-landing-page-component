import type { Metadata } from "next"
import { LegalBlock, LegalShell } from "@/components/veggiehack/legal-shell"

export const metadata: Metadata = {
  title: "Privacy Policy — VeggieHack",
  description:
    "How VeggieHack collects, uses, and protects waitlist email addresses and other personal information for users in the United States.",
}

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      lede="This policy explains how VeggieHack protects waitlist email addresses and other personal information for people in the United States, including California residents."
    >
      <LegalBlock title="1. Who we are">
        <p>
          VeggieHack (&quot;we,&quot; &quot;us&quot;) operates veggiehack product experiences, including this marketing site
          and the upcoming mobile app waitlist. This notice is designed for US users and is intended to align with the
          California Consumer Privacy Act as amended by the CPRA, other state privacy laws with similar rights, CAN-SPAM,
          and ordinary US consumer-protection expectations. It is not legal advice.
        </p>
      </LegalBlock>
      <LegalBlock title="2. Email assets we collect">
        <p>
          When you join the waitlist or send a Contact form, we collect the email address you type, plus optional name,
          topic, and message. We treat that address as a protected email asset: it is personal information, not a public
          marketing list. We may also store technical data such as timestamp, browser type, and approximate region from
          your IP so we can fight abuse and measure launch interest.
        </p>
      </LegalBlock>
      <LegalBlock title="3. How we use waitlist emails">
        <p>
          We use waitlist emails only to (a) confirm you signed up, (b) notify you when US beta or launch access opens,
          (c) answer support or privacy requests, and (d) keep records we need for security and legal compliance. We do
          not use waitlist addresses to send unrelated third-party ads.
        </p>
      </LegalBlock>
      <LegalBlock title="4. Sharing, selling, and CAN-SPAM">
        <p>
          We do not sell personal information, including email addresses, as &quot;sale&quot; or &quot;sharing&quot; is
          defined under the CPRA. We do not rent or trade waitlist lists. Service providers who host email or site
          infrastructure may process addresses solely on our instructions. Commercial emails include a valid physical
          postal address when required and a working unsubscribe link, consistent with the CAN-SPAM Act.
        </p>
      </LegalBlock>
      <LegalBlock title="5. Retention and security">
        <p>
          We keep waitlist emails until you unsubscribe or ask us to delete them, or until we reasonably conclude the
          launch program has ended—whichever is sooner—unless a longer period is required to resolve a dispute or
          comply with law. We use reasonable administrative and technical safeguards. No internet transmission is
          guaranteed 100% secure.
        </p>
      </LegalBlock>
      <LegalBlock title="6. Your US privacy rights">
        <p>
          Depending on your state, you may have the right to know, access, correct, or delete personal information, to
          opt out of sale/sharing (we do not sell), and to not be discriminated against for exercising those rights.
          California residents may also limit use of sensitive personal information; we do not collect SSN, precise
          geolocation, or health records on this site. Submit requests through the Contact page. We will verify the
          request using the email on file.
        </p>
      </LegalBlock>
      <LegalBlock title="7. Children">
        <p>
          VeggieHack is not directed to children under 13, and we do not knowingly collect personal information from
          them (COPPA). If you believe a child submitted an email, contact us and we will delete it.
        </p>
      </LegalBlock>
      <LegalBlock title="8. Nutrition data">
        <p>
          Macro and calorie figures shown in the Food Hack Studio are generated estimates for meal planning. They are
          not medical records and are not used to profile your health unless you later create an account in a future
          product with separate notice.
        </p>
      </LegalBlock>
      <LegalBlock title="9. Contact">
        <p>
          Privacy and deletion requests: use the Contact form and choose &quot;Email privacy / CPRA request,&quot; or
          email support@veggiehack.com. We aim to acknowledge California requests within 10 business days.
        </p>
      </LegalBlock>
    </LegalShell>
  )
}
