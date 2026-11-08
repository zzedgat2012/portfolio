import type { ReactNode } from 'react';
import { type Profile, type ProfileLink, ProfileLinkIcon } from '@/features/profile';
import { toWebsiteLabel } from '@/shared/lib';
import { Container, SectionEyebrow } from '@/shared/ui';

type ContactSectionProps = {
  profile: Pick<Profile, 'name' | 'role' | 'location' | 'contact'>;
  /** Profile links flagged `showInContact`, in file order. */
  links: ProfileLink[];
};

const HEADING_ID = 'contact-heading';

/** `#contact`: name, role · location, contact details and the contact links as tiles. */
export function ContactSection({ profile, links }: ContactSectionProps) {
  const { contact } = profile;

  return (
    <section id="contact" aria-labelledby={HEADING_ID} className="scroll-mt-20 py-20">
      <Container>
        <SectionEyebrow id={HEADING_ID}>Contact</SectionEyebrow>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-4xl leading-none font-bold text-foreground sm:text-6xl">
              {profile.name}
            </p>
            <p className="mt-4 text-muted-foreground">
              {profile.role} · {profile.location}
            </p>
          </div>
          <div className="space-y-8">
            <dl className="space-y-2 text-sm">
              <ContactDetail term="Phone">{contact.phone}</ContactDetail>
              <ContactDetail term="Email">
                <a href={`mailto:${contact.email}`} className="hover:text-accent">
                  {contact.email}
                </a>
              </ContactDetail>
              <ContactDetail term="Portfolio">
                <a href={contact.website} className="hover:text-accent">
                  {toWebsiteLabel(contact.website)}
                </a>
              </ContactDetail>
              <ContactDetail term="Languages">{contact.languages}</ContactDetail>
            </dl>
            {links.length > 0 ? (
              <ul aria-label="Contact links" className="grid grid-cols-2 gap-3">
                {links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <a
                      href={link.url}
                      className="flex items-center gap-3 rounded-lg bg-card p-4 font-mono text-sm text-foreground transition-transform duration-150 hover:scale-105"
                    >
                      <ProfileLinkIcon
                        icon={link.icon}
                        className="shrink-0 text-muted-foreground"
                      />
                      <span className="truncate">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactDetail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
