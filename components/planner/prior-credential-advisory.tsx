import { GraduationCap } from "lucide-react"

import type { PriorCredential } from "@/types/planner.type"

interface PriorCredentialAdvisoryProps {
  credential: PriorCredential
}

/**
 * Returns the advisory message associated with a prior credential.
 */
function getCredentialMessage(credential: PriorCredential): string | null {
  switch (credential) {
    case "associate":
      return "Your courses were evaluated individually. Some institutions may waive additional general-education requirements based on an earned associate degree."

    case "bachelor":
      return "Second-degree policies vary by institution. This plan may include requirements that your institution would waive for students who already hold a bachelor’s degree."

    case "other":
      return "Credential recognition varies by institution. This plan evaluates completed courses individually and does not automatically apply credential-level waivers."

    case "none":
      return null
  }
}

/**
 * Explains the limitations of prior-credential evaluation in V1.
 */
export function PriorCredentialAdvisory({
  credential,
}: PriorCredentialAdvisoryProps) {
  const message = getCredentialMessage(credential)

  if (!message) {
    return null
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-info bg-info-subtle p-4 text-info-text">
      <GraduationCap className="mt-0.5 size-5 shrink-0" />

      <div>
        <p className="text-sm font-semibold">Prior credential noted</p>

        <p className="mt-1 text-sm leading-6">{message}</p>
      </div>
    </div>
  )
}
