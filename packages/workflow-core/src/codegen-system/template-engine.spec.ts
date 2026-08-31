import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from './template-engine';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('render (variable interpolation)', () => {
    it('should replace simple variables', () => {
      const result = engine.render('Hello, {{name}}!', { name: 'World' });
      expect(result).toBe('Hello, World!');
    });

    it('should replace multiple variables', () => {
      const result = engine.render('{{greeting}}, {{name}}!', {
        greeting: 'Hello',
        name: 'TypeScript',
      });
      expect(result).toBe('Hello, TypeScript!');
    });

    it('should handle missing variables by keeping the placeholder', () => {
      const result = engine.render('Hello, {{name}}!', {});
      expect(result).toBe('Hello, {{name}}!');
    });

    it('should handle numeric values', () => {
      const result = engine.render('Count: {{count}}', { count: 42 });
      expect(result).toBe('Count: 42');
    });

    it('should handle boolean values', () => {
      const result = engine.render('Active: {{active}}', { active: true });
      expect(result).toBe('Active: true');
    });

    it('should handle nested object paths', () => {
      const result = engine.render('{{user.name}}', { user: { name: 'Alice' } });
      expect(result).toBe('Alice');
    });
  });

  describe('render (conditionals)', () => {
    it('should render {{#if}} block when condition is truthy', () => {
      const result = engine.render('{{#if show}}Visible{{/if}}', { show: true });
      expect(result).toBe('Visible');
    });

    it('should not render {{#if}} block when condition is falsy', () => {
      const result = engine.render('{{#if show}}Visible{{/if}}', { show: false });
      expect(result).toBe('');
    });

    it('should not render {{#if}} block when condition is missing', () => {
      const result = engine.render('{{#if show}}Visible{{/if}}', {});
      expect(result).toBe('');
    });

    it('should render {{#unless}} block when condition is falsy', () => {
      const result = engine.render('{{#unless active}}Inactive{{/unless}}', { active: false });
      expect(result).toBe('Inactive');
    });

    it('should not render {{#unless}} block when condition is truthy', () => {
      const result = engine.render('{{#unless active}}Inactive{{/unless}}', { active: true });
      expect(result).toBe('');
    });

    it('should handle conditionals with variables inside', () => {
      const result = engine.render('{{#if prefix}}import {{prefix}} from "x";{{/if}}', {
        prefix: 'React',
      });
      expect(result).toBe('import React from "x";');
    });
  });

  describe('render (loops)', () => {
    it('should render {{#each}} with string items', () => {
      const result = engine.render('{{#each items}}{{this}}{{/each}}', {
        items: ['a', 'b', 'c'],
      });
      expect(result).toBe('abc');
    });

    it('should render {{#each}} with object items', () => {
      const result = engine.render('{{#each items}}{{this.name}} {{/each}}', {
        items: [{ name: 'Alice' }, { name: 'Bob' }],
      });
      expect(result).toBe('Alice Bob ');
    });

    it('should render {{#each}} with @index', () => {
      const result = engine.render('{{#each items}}{{@index}}:{{this}} {{/each}}', {
        items: ['x', 'y'],
      });
      expect(result).toBe('0:x 1:y ');
    });

    it('should render empty string for non-array', () => {
      const result = engine.render('{{#each items}}{{this}}{{/each}}', { items: 'not-array' });
      expect(result).toBe('');
    });

    it('should render empty string for missing variable', () => {
      const result = engine.render('{{#each items}}{{this}}{{/each}}', {});
      expect(result).toBe('');
    });
  });

  describe('combined syntax', () => {
    it('should handle loops with conditionals', () => {
      const result = engine.render(
        '{{#each fields}}{{#if required}}{{this.name}}! {{/if}}{{/each}}',
        {
          fields: [
            { name: 'id', required: true },
            { name: 'desc', required: false },
            { name: 'name', required: true },
          ],
        },
      );
      expect(result).toBe('id! name! ');
    });
  });
});
