import { Badge } from '../ui/Badge'
import type { BadgeTone } from '../ui/Badge'
import type { CredentialStatus } from '../../lib/credentials'
import { credentialStatusLabel } from '../../lib/credentials'

const tones: Record<CredentialStatus, BadgeTone> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'error',
}

export const CredentialBadge = ({ status }: { status: CredentialStatus }) => (
  <Badge tone={tones[status]} dot>
    {credentialStatusLabel[status]}
  </Badge>
)

export default CredentialBadge
