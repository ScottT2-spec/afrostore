import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parsePageContent } from "@/lib/page-content";
import FunnelStepView, { type PublicFunnelStep } from "./FunnelStepView";

type Props = {
  params: Promise<{ slug: string; funnelId: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function FunnelPage({ params, searchParams }: Props) {
  const { slug, funnelId } = await params;
  const { step: stepParam } = await searchParams;

  const site = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    select: { id: true, slug: true, name: true, logo: true },
  });
  if (!site) return notFound();

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, siteId: site.id, isActive: true },
    include: {
      steps: {
        orderBy: { position: "asc" },
        include: {
          page: { select: { id: true, title: true, content: true, type: true } },
          form: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              fields: true,
              submitButtonText: true,
              successMessage: true,
            },
          },
        },
      },
    },
  });

  if (!funnel || funnel.status !== "ACTIVE" || funnel.steps.length === 0) return notFound();

  const requestedPosition = stepParam !== undefined ? parseInt(stepParam, 10) : 0;
  const currentIndex = Number.isFinite(requestedPosition)
    ? Math.min(Math.max(requestedPosition, 0), funnel.steps.length - 1)
    : 0;
  const currentStep = funnel.steps[currentIndex];

  const landingBlocks = currentStep.page
    ? parsePageContent(currentStep.page.content).blocks
    : parsePageContent(currentStep.pageContent).blocks;

  const publicStep: PublicFunnelStep = {
    id: currentStep.id,
    name: currentStep.name,
    type: currentStep.type,
    position: currentIndex,
    isLastStep: currentIndex === funnel.steps.length - 1,
    settings: (currentStep.settings as Record<string, unknown> | null) || {},
    landingBlocks,
    form: currentStep.form
      ? {
          id: currentStep.form.id,
          name: currentStep.form.name,
          slug: currentStep.form.slug,
          description: currentStep.form.description,
          fields: currentStep.form.fields as Array<{ id: string; label: string; type: string; placeholder?: string; required?: boolean }>,
          submitButtonText: currentStep.form.submitButtonText,
          successMessage: currentStep.form.successMessage,
        }
      : null,
  };

  return (
    <FunnelStepView
      siteSlug={site.slug}
      siteName={site.name}
      siteLogo={site.logo}
      funnelId={funnel.id}
      funnelName={funnel.name}
      step={publicStep}
    />
  );
}
