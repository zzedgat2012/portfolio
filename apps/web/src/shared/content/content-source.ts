import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { isSlug, NotFoundError, ValidationError } from '@portfolio/contracts';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

/** One entry of a folder collection: `<collection>/<slug>.md|yml`. */
export type Entry<T> = { slug: string; data: T; body: string };

export type ContentSource = {
  /** Every entry of a folder collection, sorted by slug; `[]` if the folder does not exist. */
  listEntries<S extends z.ZodType>(collection: string, schema: S): Promise<Entry<z.output<S>>[]>;
  /** The entry with that slug, or `null`. */
  findEntry<S extends z.ZodType>(
    collection: string,
    slug: string,
    schema: S,
  ): Promise<Entry<z.output<S>> | null>;
  /** A file collection's data (`settings/site.yml`); throws `NotFoundError` if missing. */
  getFile<S extends z.ZodType>(relativePath: string, schema: S): Promise<z.output<S>>;
};

const ENTRY_EXTENSIONS = ['.md', '.yml'] as const;

// YAML 1.2 (the `yaml` package) keeps `2024-05-01` a string; gray-matter's default
// js-yaml engine would turn it into a Date.
const MATTER_OPTIONS = { engines: { yaml: (source: string) => parseYaml(source) as object } };

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

/** Reads and validates content files under `rootDir`. Server-only: runs at build time. */
export function createContentSource(rootDir: string): ContentSource {
  async function readDocument(relativePath: string): Promise<{ data: unknown; body: string }> {
    const raw = await readFile(path.join(rootDir, relativePath), 'utf8');
    if (relativePath.endsWith('.md')) {
      const { data, content } = matter(raw, MATTER_OPTIONS);
      return { data, body: content };
    }
    return { data: parseYaml(raw) as unknown, body: '' };
  }

  function validate<S extends z.ZodType>(relativePath: string, schema: S, data: unknown) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(`${relativePath}: ${z.prettifyError(result.error)}`);
    }
    return result.data;
  }

  async function readEntry<S extends z.ZodType>(collection: string, file: string, schema: S) {
    const relativePath = path.posix.join(collection, file);
    const { data, body } = await readDocument(relativePath);
    return { slug: path.parse(file).name, data: validate(relativePath, schema, data), body };
  }

  return {
    async listEntries(collection, schema) {
      let files: string[];
      try {
        files = await readdir(path.join(rootDir, collection));
      } catch (error) {
        if (isMissingFile(error)) {
          return [];
        }
        throw error;
      }
      const entryFiles = files
        .filter((file) => ENTRY_EXTENSIONS.some((extension) => file.endsWith(extension)))
        .sort();
      return Promise.all(entryFiles.map((file) => readEntry(collection, file, schema)));
    },

    async findEntry(collection, slug, schema) {
      if (!isSlug(slug)) {
        return null;
      }
      for (const extension of ENTRY_EXTENSIONS) {
        try {
          return await readEntry(collection, `${slug}${extension}`, schema);
        } catch (error) {
          if (!isMissingFile(error)) {
            throw error;
          }
        }
      }
      return null;
    },

    async getFile(relativePath, schema) {
      try {
        const { data } = await readDocument(relativePath);
        return validate(relativePath, schema, data);
      } catch (error) {
        if (isMissingFile(error)) {
          throw new NotFoundError(`content file ${relativePath}`);
        }
        throw error;
      }
    },
  };
}
