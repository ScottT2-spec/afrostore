/**
 * Funnel step-flow logic.
 *
 * Ported 1:1 from the CartFlows (WordPress/WooCommerce) plugin, so the
 * step-transition behavior matches exactly - including its quirks. Do not
 * "fix" the quirks noted below without checking with product first; they
 * are intentional parity with the original, not bugs introduced here.
 *
 * Source mapping (CartFlows PHP -> here):
 *   - Cartflows_Step_Factory::get_direct_next_step_id()
 *       -> getDirectNextStepId()
 *   - Cartflows_Flow_Frontend::get_thankyou_page_id() / is_thankyou_page_exists()
 *       -> getNextStepOfType()
 *   - Cartflows_Step_Post_Type::query_fix() (disabled-step redirect branch)
 *       -> getDisabledStepFallbackRedirect()
 */

export interface FlowStep {
  id: string;
  type: string;
  position: number;
  isEnabled: boolean;
}

/**
 * Direct next step, skipping disabled steps.
 *
 * Mirrors get_direct_next_step_id(): from the current step's position,
 * scan forward and return the first step that is NOT disabled. Used for
 * step types (e.g. LEAD_FORM/optin) that should just move to whatever the
 * next live step is.
 */
export function getDirectNextStepId(steps: FlowStep[], currentStepId: string): string | null {
  const ordered = [...steps].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((s) => s.id === currentStepId);
  if (index === -1) return null;

  for (let i = index + 1; i < ordered.length; i++) {
    if (ordered[i].isEnabled) {
      return ordered[i].id;
    }
  }
  return null;
}

/**
 * Find the next step of a given type after the current step.
 *
 * Mirrors get_thankyou_page_id()/is_thankyou_page_exists(): from the
 * current step's position, scan forward through ALL subsequent steps
 * (including disabled ones - CartFlows does NOT check is_step_disabled()
 * here, unlike getDirectNextStepId above) and return the first one whose
 * type matches. Used for CHECKOUT -> THANK_YOU.
 *
 * Quirk preserved on purpose: a disabled step of the target type still
 * counts as a match, and steps of other types in between are simply
 * skipped over (not treated as blockers).
 */
export function getNextStepOfType(steps: FlowStep[], currentStepId: string, targetType: string): string | null {
  const ordered = [...steps].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((s) => s.id === currentStepId);
  if (index === -1) return null;

  for (let i = index + 1; i < ordered.length; i++) {
    if (ordered[i].type === targetType) {
      return ordered[i].id;
    }
  }
  return null;
}

/**
 * Fallback redirect target when a visitor lands on a disabled step.
 *
 * Mirrors the disabled-step branch of query_fix(): NOT a forward-only
 * scan - it walks the WHOLE ordered step list from the start and returns
 * the first step that is (a) not the current step and (b) not disabled.
 * This means the fallback can land earlier in the funnel than the
 * disabled step itself, exactly as in CartFlows.
 */
export function getDisabledStepFallbackRedirect(steps: FlowStep[], currentStepId: string): string | null {
  const ordered = [...steps].sort((a, b) => a.position - b.position);
  for (const step of ordered) {
    if (step.id !== currentStepId && step.isEnabled) {
      return step.id;
    }
  }
  return null;
}
