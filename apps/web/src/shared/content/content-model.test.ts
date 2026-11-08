import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type ContentModel, contentModel } from '@portfolio/contracts';
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

const decapFieldSchema = z.looseObject({
  name: z.string(),
  widget: z.string(),
  required: z.boolean().optional(),
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
type DecapField = z.infer<typeof decapFieldSchema>;

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

/** Field names Decap edits, and whether Decap requires each one (Decap's default is required). */
function describeDecapFields(fields: DecapField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, field.required !== false]));
}

/** Field names Zod knows, and whether each one rejects `undefined`. */
function describeZodFields(schema: z.ZodObject) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([name, field]) => [
      name,
      !(field as z.ZodType).safeParse(undefined).success,
    ]),
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

  describe.each(decapFolders)('folder collection $name', (folder) => {
    const folderModel = model.folders[folder.name];

    test('points at the same folder and extension as the content model', () => {
      expect(folder.folder).toBe(`content/${folder.name}`);
      expect(folder.extension).toBe(folderModel?.extension);
    });

    test('has the same fields, with the same required-ness, as the Zod schema', () => {
      expect(folderModel).toBeDefined();
      expect(describeDecapFields(folder.fields)).toEqual(describeZodFields(folderModel!.schema));
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
});
