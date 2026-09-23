"use client"

import { useState } from "react"

const faqs = [
  {
    id: "macros",
    question: "How does VeggieHack calculate protein, carbs, and fat macros?",
    answer:
      "Each generated hack estimates macros from the listed ingredients and serving size. Protein, carbohydrate, and fat grams are totaled, then shown as fitness-oriented rings (for example protein density and calorie load). These figures are planning estimates for plant-based meals—not a lab assay or a personalized diet prescription.",
  },
  {
    id: "protein-target",
    question: "What protein target should I use on Protein Booster versus Student Budget?",
    answer:
      "Protein Booster aims for roughly 30g or more of complete plant protein per plate, pairing complementary amino sources such as tofu, edamame, and quinoa. Student Budget still reports protein per serving but prioritizes cost under about $3, so totals may land closer to 18–22g. Use the rings as a snapshot, then adjust portions if you are cutting, maintaining, or building.",
  },
  {
    id: "calories",
    question: "How are calories estimated for fitness tracking?",
    answer:
      "Calories are derived from standard USDA-style energy values for the ingredients in that hack (protein and carbs at 4 kcal/g, fat at 9 kcal/g, plus typical kitchen oils). The kcal ring is a relative load for that plate, not your daily TDEE. VeggieHack does not collect body weight, age, or activity to compute a custom calorie budget during waitlist.",
  },
  {
    id: "waitlist-launch",
    question: "When does the US waitlist launch, and what do I get for joining?",
    answer:
      "The iOS and Android beta is coming soon for United States testers. Joining the waitlist reserves a notification slot only—it is not a paid subscription and does not guarantee a launch date. Early testers are slated for lifetime Pro access when the app opens. We email solely about beta availability, using the address you submit.",
  },
  {
    id: "email-assets",
    question: "How are waitlist emails protected, and can I opt out?",
    answer:
      "Waitlist addresses are treated as personal information under US law, including CAN-SPAM and California CPRA rights. We do not sell email lists. You can unsubscribe from any notice, and California residents may request access, deletion, or correction via the Contact page. See the Privacy Policy for retention and security details.",
  },
]

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id)

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <section id="faq" className="bg-[#f4f5f3] pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0f8a5f]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
          Launch FAQ
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0d1512] sm:text-4xl">
            Macros, waitlist, and how we launch.
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-[#0d1512]/55">
            Five answers on fitness macro math and the US waitlist—tap a row to expand.
          </p>
        </div>

        <div className="mt-10 divide-y divide-[#0d1512]/10 overflow-hidden rounded-2xl border border-[#0d1512]/10 bg-white shadow-sm">
          {faqs.map((item, index) => {
            const open = openId === item.id
            const panelId = `faq-panel-${item.id}`
            const buttonId = `faq-button-${item.id}`
            return (
              <div key={item.id} className={open ? "bg-[#f7faf8]" : "bg-white"}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-[#f4f5f3]"
                  >
                    <span className="font-display text-xs font-bold text-[#0f8a5f]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-[#0d1512] sm:text-base">{item.question}</span>
                    <span
                      className="vh-accordion-chevron flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0d1512]/10 bg-white text-[#0d1512]"
                      data-open={open}
                      aria-hidden
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div className="vh-accordion-panel" data-open={open} id={panelId} role="region" aria-labelledby={buttonId}>
                  <div>
                    <p className="px-5 pb-5 pl-[3.75rem] text-sm leading-relaxed text-[#0d1512]/60">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
