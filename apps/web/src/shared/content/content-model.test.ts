import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type ContentModel, contentModel, listBrokenRelations } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { createContentSource } from './content-source';

/**
 * Guards the rule "one model, two mirrors" (docs/conventions.md › Decap rules):
 * Decap's config.yml and the Zod schemas in @portfolio/contracts must describe the same
 * collections and fields, and every committed content file must parse.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, '../../../../..');
const CONFIG_PATH = path.join(REPO_ROOT, 'apps/web/public/admin/config.yml');
const CONTENT_ROOTS = {
  content: path.join(REPO_ROOT, 'content'),
  'e2e fixtures': path.join(REPO_ROOT, 'apps/web/e2e/content'),
};

type DecapField = {
  name: string;
  widget: string;
  required?: boolean | undefined;
  fields?: DecapField[] | undefined;
};
const decapFieldSchema: z.ZodType<DecapField> = z.looseObject({
  name: z.string(),
  widget: z.string(),
  required: z.boolean().optional(),
  get fields() {
    return z.array(decapFieldSchema).optional();
  },
});
const decapFolderCollectionSchema = z.looseObject({
  name: z.string(),
  folder: z.string(),
  extension: z.enum(['md', 'yml']),
  fields: z.array(decapFieldSchema),
});
const decapFileCollectionSchema = z.looseObject({
  name: z.string(),
  files: z.array(
    z.looseObject({ name: z.string(), file: z.string(), fields: z.array(decapFieldSchema) }),
  ),
});
const decapConfigSchema = z.looseObject({
  backend: z.looseObject({ name: z.string(), repo: z.string().optional() }),
  media_folder: z.string(),
  public_folder: z.string(),
  collections: z.array(z.looseObject({ name: z.string() })),
});

const config = decapConfigSchema.parse(parseYaml(await readFile(CONFIG_PATH, 'utf8')));
const model: ContentModel = contentModel;

const decapFiles = config.collections.flatMap((collection) => {
  const parsed = decapFileCollectionSchema.safeParse(collection);
  return parsed.success
    ? parsed.data.files.map((file) => ({ ...file, key: `${parsed.data.name}/${file.name}` }))
    : [];
});
const decapFolders = config.collections.flatMap((collection) => {
  const parsed = decapFolderCollectionSchema.safeParse(collection);
  return parsed.success ? [parsed.data] : [];
});

test('every Decap collection is either a file or a folder collection', () => {
  expect(decapFiles.length + decapFolders.length).toBeGreaterThanOrEqual(config.collections.length);
});

/** The Markdown body of an `md` entry: a Decap field, but not part of the frontmatter schema. */
const BODY_FIELD = 'body';

type FieldDescription = { isRequired: boolean; fields?: Record<string, FieldDescription> };

/**
 * Field names Decap edits, whether Decap requires each one (Decap's default is required) and,
 * for object/list widgets with `fields`, the same description of their sub-fields.
 */
function describeDecapFields(fields: DecapField[]): Record<string, FieldDescription> {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      {
        isRequired: field.required !== false,
        ...(field.fields ? { fields: describeDecapFields(field.fields) } : {}),
      },
    ]),
  );
}

/** The object schema inside optional/default wrappers and arrays, if any. */
function findNestedObject(schema: z.ZodType): z.ZodObject | null {
  if (schema instanceof z.ZodObject) {
    return schema;
  }
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    return findNestedObject(schema.unwrap() as z.ZodType);
  }
  if (schema instanceof z.ZodArray) {
    return findNestedObject(schema.element as z.ZodType);
  }
  return null;
}

/** Field names Zod knows, whether each one rejects `undefined`, and nested object fields. */
function describeZodFields(schema: z.ZodObject): Record<string, FieldDescription> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([name, field]) => {
      const nested = findNestedObject(field as z.ZodType);
      return [
        name,
        {
          isRequired: !(field as z.ZodType).safeParse(undefined).success,
          ...(nested ? { fields: describeZodFields(nested) } : {}),
        },
      ];
    }),
  );
}

describe('Decap config.yml', () => {
  test('commits to the GitHub repository and stores media under public/uploads', () => {
    expect(config.backend).toMatchObject({ name: 'github', repo: 'zzedgat2012/portfolio' });
    expect(config.media_folder).toBe('apps/web/public/uploads');
    expect(config.public_folder).toBe('/uploads');
  });

  test('defines exactly the file collections of the content model', () => {
    expect(decapFiles.map((file) => file.key).sort()).toEqual(Object.keys(model.files).sort());
  });

  test('defines exactly the folder collections of the content model', () => {
    expect(decapFolders.map((folder) => folder.name).sort()).toEqual(
      Object.keys(model.folders).sort(),
    );
  });

  describe.each(decapFiles)('file collection $key', (file) => {
    const fileModel = model.files[file.key];

    test('points at the same file as the content model', () => {
      expect(file.file).toBe(`content/${fileModel?.path}`);
    });

    test('has the same fields, with the same required-ness, as the Zod schema', () => {
      expect(fileModel).toBeDefined();
      expect(describeDecapFields(file.fields)).toEqual(describeZodFields(fileModel!.schema));
    });
  });

  describe.each(decapFolders.filter((folder) => folder.extension === 'md'))(
    'Markdown folder collection $name',
    (folder) => {
      test('edits the Markdown body with a markdown widget', () => {
        expect(folder.fields.find((field) => field.name === BODY_FIELD)?.widget).toBe('markdown');
      });
    },
  );

  describe.each(decapFolders)('folder collection $name', (folder) => {
    const folderModel = model.folders[folder.name];

    test('points at the same folder and extension as the content model', () => {
      expect(folder.folder).toBe(`content/${folder.name}`);
      expect(folder.extension).toBe(folderModel?.extension);
    });

    test('has the same fields, with the same required-ness, as the Zod schema', () => {
      expect(folderModel).toBeDefined();
      const frontmatterFields = folder.fields.filter(
        (field) => folder.extension !== 'md' || field.name !== BODY_FIELD,
      );
      expect(describeDecapFields(frontmatterFields)).toEqual(
        describeZodFields(folderModel!.schema),
      );
    });

    test.each(folderModel?.relations ?? [])(
      '[story 1.1] edits $field with a relation widget to $collection',
      (relation) => {
        expect(folder.fields.find((field) => field.name === relation.field)).toMatchObject({
          widget: 'relation',
          collection: relation.collection,
          value_field: '{{slug}}',
        });
      },
    );

    test('[story 1.1] hides legacyWpId from editors', () => {
      const legacyWpId = folder.fields.find((field) => field.name === 'legacyWpId');
      expect(legacyWpId === undefined || legacyWpId.widget === 'hidden').toBe(true);
    });
  });
});

describe.each(Object.entries(CONTENT_ROOTS))('%s', (_label, root) => {
  const source = createContentSource(root);

  test.each(Object.entries(model.files))('has a valid %s file', async (_key, file) => {
    await expect(source.getFile(file.path, file.schema)).resolves.toBeDefined();
  });

  test.each(Object.entries(model.folders))('has only valid %s entries', async (name, folder) => {
    await expect(source.listEntries(name, folder.schema)).resolves.toBeDefined();
  });

  test('[story 1.1] has relations that all point to existing entries', async () => {
    const entries = Object.fromEntries(
      await Promise.all(
        Object.entries(model.folders).map(
          async ([name, folder]) => [name, await source.listEntries(name, folder.schema)] as const,
        ),
      ),
    );

    const brokenRelations = listBrokenRelations(model, entries);

    expect(brokenRelations, brokenRelations.join('\n')).toEqual([]);
  });
});
