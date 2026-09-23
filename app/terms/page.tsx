import type { Metadata } from "next"
import { LegalBlock, LegalShell } from "@/components/veggiehack/legal-shell"

export const metadata: Metadata = {
  title: "Terms of Service — VeggieHack",
  description: "US terms governing use of the VeggieHack website, waitlist, and recipe previews.",
}

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of Service"
      lede="These terms govern your use of the VeggieHack website, waitlist, and recipe previews. By using the site, you agree to this contract under United States law."
    >
      <LegalBlock title="1. Agreement">
        <p>
          These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and VeggieHack. If you do not
          agree, do not use the site or join the waitlist. We may update these Terms; the effective date above is the
          current version. Continued use after an update means you accept the revised Terms.
        </p>
      </LegalBlock>
      <LegalBlock title="2. Eligibility">
        <p>
          You must be at least 13 years old, and you must be able to form a contract under US law. If you use VeggieHack
          on behalf of a company, you represent that you have authority to bind that company.
        </p>
      </LegalBlock>
      <LegalBlock title="3. Waitlist (not a paid plan)">
        <p>
          Joining the waitlist is free. It is a request to be notified about a future US iOS/Android beta. It does not
          create a paid subscription, reserved seat, or guarantee of launch timing, features, or lifetime Pro access
          until we confirm those benefits in a later offer. We may close, delay, or limit the waitlist at any time.
        </p>
      </LegalBlock>
      <LegalBlock title="4. Recipe and macro disclaimers">
        <p>
          Food hacks, prices, cook times, and macro rings are illustrative estimates for general fitness meal planning.
          They are not medical, dietetic, or allergen advice. VeggieHack does not diagnose, treat, or guarantee muscle
          gain, fat loss, or nutrient adequacy. Consult a licensed clinician or registered dietitian before changing
          your diet, especially if you have a medical condition. Always check ingredient labels for allergens.
        </p>
      </LegalBlock>
      <LegalBlock title="5. Acceptable use">
        <p>
          You may not scrape, reverse engineer, or overload the site; submit false emails; impersonate others; or use
          the service for unlawful content. We may remove waitlist entries that look automated or abusive.
        </p>
      </LegalBlock>
      <LegalBlock title="6. Intellectual property">
        <p>
          VeggieHack names, marks, UI, copy, and recipe presentations are owned by us or our licensors. You receive a
          limited, revocable license to view the site for personal, non-commercial use. User messages you send remain
          yours; you grant us a license to use them to operate support.
        </p>
      </LegalBlock>
      <LegalBlock title="7. Disclaimers and liability">
        <p>
          THE SITE AND WAITLIST ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. TO THE MAXIMUM EXTENT
          PERMITTED BY US LAW, VEGGIEHACK IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE SITE WILL
          NOT EXCEED ONE HUNDRED US DOLLARS (US $100). SOME STATES DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE STATES
          OUR LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED.
        </p>
      </LegalBlock>
      <LegalBlock title="8. Governing law">
        <p>
          These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law rules, except
          that US federal law (including CAN-SPAM and COPPA) applies where it controls. Exclusive venue for disputes that
          are not resolved informally is the state or federal courts located in Delaware, unless applicable consumer law
          requires otherwise in your state of residence.
        </p>
      </LegalBlock>
      <LegalBlock title="9. Contact">
        <p>
          Questions about these Terms: use the Contact page or email support@veggiehack.com.
        </p>
      </LegalBlock>
    </LegalShell>
  )
}
