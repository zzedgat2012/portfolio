import type { LinkIcon } from '@portfolio/contracts';
import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  Code,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  ThumbsUp,
  UserRound,
} from 'lucide-react';
import { assertNever } from '@/shared/lib';

type ProfileLinkIconProps = { icon: LinkIcon; size?: number; className?: string };

/**
 * Decorative icon of a profile link (lucide-react, D3). lucide-react 1.x ships no brand logos,
 * so brands use the closest generic glyph; the link's label is always its accessible name.
 */
export function ProfileLinkIcon({ icon, size = 16, className }: ProfileLinkIconProps) {
  const props = { size, className, 'aria-hidden': true } as const;
  switch (icon) {
    case 'portfolio':
      return <BriefcaseBusiness {...props} />;
    case 'website':
      return <Globe {...props} />;
    case 'linkedin':
      return <UserRound {...props} />;
    case 'github':
      return <Code {...props} />;
    case 'email':
      return <Mail {...props} />;
    case 'phone':
      return <Phone {...props} />;
    case 'whatsapp':
      return <MessageCircle {...props} />;
    case 'facebook':
      return <ThumbsUp {...props} />;
    case 'instagram':
      return <Camera {...props} />;
    case 'twitter':
      return <AtSign {...props} />;
    default:
      return assertNever(icon);
  }
}
