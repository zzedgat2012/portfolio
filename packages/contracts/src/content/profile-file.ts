import { z } from 'zod';
import {
  httpUrlSchema,
  stringListSchema,
  textSchema,
  uploadPathSchema,
  yearMonthSchema,
} from './fields';

/** Icons a profile link can use (rendered with lucide-react, D3). */
export const LINK_ICONS = [
  'portfolio',
  'website',
  'linkedin',
  'github',
  'email',
  'phone',
  'whatsapp',
  'facebook',
  'instagram',
  'twitter',
] as const;

export type LinkIcon = (typeof LINK_ICONS)[number];

const requiredListOf = <T extends z.ZodType>(item: T) => z.array(item).min(1);

const experienceSchema = z
  .strictObject({
    company: textSchema(120),
    role: textSchema(120),
    startOn: yearMonthSchema,
    /** Absent while the position is current. */
    endOn: yearMonthSchema.optional(),
  })
  .refine((item) => item.endOn === undefined || item.endOn >= item.startOn, {
    message: 'endOn must not be before startOn',
    path: ['endOn'],
  });

const linkSchema = z.strictObject({
  label: textSchema(60),
  url: z
    .string()
    .regex(/^(https?:\/\/|mailto:|tel:)\S+$/, 'Must be an http(s), mailto: or tel: URL'),
  icon: z.enum(LINK_ICONS),
  showInHero: z.boolean().default(false),
  showInContact: z.boolean().default(false),
});

/** `content/settings/profile.yml`: everything the home page, CV and author blocks show about Edgar. */
export const profileFileSchema = z.strictObject({
  name: textSchema(80),
  role: textSchema(80),
  location: textSchema(120),
  heroTitle: textSchema(80),
  heroTagline: textSchema(300),
  portrait: uploadPathSchema,
  portraitAlt: textSchema(200),
  /** Markdown. */
  bio: z.string().trim().min(1),
  technologies: requiredListOf(textSchema(80)),
  whatIDo: requiredListOf(textSchema(200)),
  education: stringListSchema(200),
  certifications: z
    .array(z.strictObject({ year: z.number().int().min(1900).max(2100), title: textSchema(200) }))
    .default([]),
  experience: requiredListOf(experienceSchema),
  experienceSummary: textSchema(200),
  contact: z.strictObject({
    phone: textSchema(40),
    email: z.email(),
    website: httpUrlSchema,
    languages: textSchema(200),
  }),
  links: requiredListOf(linkSchema),
});

export type ProfileFile = z.infer<typeof profileFileSchema>;
