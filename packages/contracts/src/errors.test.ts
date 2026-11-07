import { describe, expect, test } from 'vitest';
import { AppError, CmsUnavailableError, NotFoundError, ValidationError } from './errors';

describe('AppError', () => {
  test('extends Error', () => {
    const error = new AppError('something', 'TEST');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('something');
    expect(error.code).toBe('TEST');
  });

  test('sets name to the constructor name', () => {
    const error = new AppError('msg', 'TEST');
    expect(error.name).toBe('AppError');
  });
});

describe('NotFoundError', () => {
  test('extends AppError', () => {
    const error = new NotFoundError('Project not found');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Project not found');
    expect(error.name).toBe('NotFoundError');
  });
});

describe('ValidationError', () => {
  test('extends AppError', () => {
    const error = new ValidationError('Invalid slug');
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Invalid slug');
    expect(error.name).toBe('ValidationError');
  });
});

describe('CmsUnavailableError', () => {
  test('extends AppError with status and path', () => {
    const error = new CmsUnavailableError(503, '/api/projects');
    expect(error).toBeInstanceOf(AppError);
    expect(error.status).toBe(503);
    expect(error.path).toBe('/api/projects');
    expect(error.name).toBe('CmsUnavailableError');
  });

  test('includes status and path in the message', () => {
    const error = new CmsUnavailableError(404, '/api/pages/home');
    expect(error.message).toContain('404');
    expect(error.message).toContain('/api/pages/home');
  });
});
