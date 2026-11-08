import { Container } from '@/shared/ui';
import { buildCopyrightNotice } from '../model';

type SiteFooterProps = { ownerName: string; year: number };

export function SiteFooter({ ownerName, year }: SiteFooterProps) {
  return (
    <footer>
      <Container>
        <p className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
          {buildCopyrightNotice(ownerName, year)}
        </p>
      </Container>
    </footer>
  );
}
