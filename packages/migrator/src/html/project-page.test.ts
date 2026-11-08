import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { mapProjectPageToExtras } from './project-page';

const kafkaHtml = await readFile(
  new URL('../../fixtures/html/project-kafka-golang-microservices.html', import.meta.url),
  'utf8',
);

describe('[story 1.2] mapProjectPageToExtras', () => {
  test('reads key features and technologies from the recorded project page', () => {
    const extras = mapProjectPageToExtras(kafkaHtml);
    expect(extras.features).toEqual([
      'Complete microservice architecture setup',
      'Kafka message broker integration',
      'Docker containerization for easy deployment',
      'Service-to-service communication patterns',
      'Scalable and maintainable code structure',
    ]);
    expect(extras.technologies).toEqual(['Golang', 'Kafka', 'Docker', 'gRPC', 'PostgreSQL']);
  });

  test('omits demo and code URLs whose href is "#"', () => {
    const extras = mapProjectPageToExtras(kafkaHtml);
    expect('demoUrl' in extras).toBe(false);
    expect('codeUrl' in extras).toBe(false);
  });

  test('keeps real demo and code URLs', () => {
    const html = `<main><div><a href="https://demo.example.com/">
      <svg></svg> View Demo </a><a href="https://github.com/x/y"><svg></svg>View Code</a></div></main>`;
    expect(mapProjectPageToExtras(html)).toEqual({
      features: [],
      technologies: [],
      demoUrl: 'https://demo.example.com/',
      codeUrl: 'https://github.com/x/y',
    });
  });
});
