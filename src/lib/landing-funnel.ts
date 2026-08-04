import { prisma } from "@/lib/db";

/**
 * Give every new LANDING_PAGE site a working lead funnel out of the box:
 * a lead-capture Form plus a 3-step Funnel (Landing -> Lead Form -> Thank You)
 * with the Lead Form step linked to the real Form record.
 *
 * Best-effort / non-fatal: called right after site creation, should never
 * block or fail the site-creation response.
 */
export async function provisionDefaultLandingFunnel(siteId: string, siteName: string) {
  const form = await prisma.form.create({
    data: {
      siteId,
      name: "Lead Capture",
      slug: "lead-capture",
      description: `Get in touch with ${siteName}`,
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true, placeholder: "Your name" },
        { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
        { id: "phone", label: "Phone Number", type: "tel", required: false, placeholder: "+234 800 000 0000" },
      ],
      submitButtonText: "Get Started",
      successMessage: "Thanks! We'll be in touch shortly.",
      isActive: true,
    },
  });

  const funnel = await prisma.funnel.create({
    data: {
      siteId,
      name: "Landing Funnel",
      description: "Default lead funnel for this landing page",
      status: "ACTIVE",
      steps: {
        create: [
          { name: "Landing Page", type: "LANDING", position: 0 },
          { name: "Lead Form", type: "LEAD_FORM", position: 1, formId: form.id },
          {
            name: "Thank You",
            type: "THANK_YOU",
            position: 2,
            settings: { buttonText: "Back to site" },
          },
        ],
      },
    },
    include: { steps: { orderBy: { position: "asc" } } },
  });

  return { form, funnel };
}
