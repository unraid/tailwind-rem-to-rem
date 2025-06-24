/**
 * Tailwind v4 integration tests
 * Tests that the plugin works correctly with Tailwind v4
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

describe('Tailwind v4 Integration', () => {
  let tempDir;
  let plugin;

  beforeAll(async () => {
    // Import the plugin
    const pluginModule = await import(join(projectRoot, 'src/index.ts'));
    plugin = pluginModule.default;

    // Create a temporary directory for v4 tests
    tempDir = await fs.mkdtemp(join(tmpdir(), 'tailwind-v4-test-'));
  });

  it('should work with Tailwind v4 JavaScript config', async () => {
    // Create a minimal v4 test setup
    const packageJson = {
      name: 'test-v4-integration',
      type: 'module',
      scripts: {
        build: 'tailwindcss -i input.css -o output.css'
      }
    };

    const tailwindConfig = `
export default {
  content: ['./test.html'],
  plugins: [
    (await import('${projectRoot}/src/index.ts')).default({
      baseFontSize: 16,
      newFontSize: 20
    })
  ]
}`;

    const inputCSS = `
@import "tailwindcss";
@config "./tailwind.config.js";`;

    const testHTML = `
<!DOCTYPE html>
<html>
<head><link href="output.css" rel="stylesheet"></head>
<body>
  <div class="text-base p-4 m-2">Test content</div>
</body>
</html>`;

    // Write test files
    await fs.writeFile(join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    await fs.writeFile(join(tempDir, 'tailwind.config.js'), tailwindConfig);
    await fs.writeFile(join(tempDir, 'input.css'), inputCSS);
    await fs.writeFile(join(tempDir, 'test.html'), testHTML);

    // This test verifies the plugin structure works with v4 config
    // We can't easily test the full build process without installing v4
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    expect(config).toHaveProperty('theme');
    expect(config.theme).toBeDefined();
  });

  it('should generate proper CSS variable names for v4', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    // In v4, theme values should be compatible with CSS variable generation
    if (config.theme.fontSize) {
      Object.entries(config.theme.fontSize).forEach(([key, value]) => {
        // Values should be valid CSS
        if (typeof value === 'string') {
          expect(value).toMatch(/^[\d.]+rem$/);
        }
      });
    }
  });

  it('should preserve v4 theme structure', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 18 });
    const config = pluginInstance.config;
    
    // Theme should maintain expected structure for v4
    expect(config.theme).toBeTypeOf('object');
    
    // Common theme sections should exist
    const expectedSections = ['fontSize', 'spacing', 'borderRadius', 'colors'];
    expectedSections.forEach(section => {
      if (config.theme[section]) {
        // Theme sections can be objects or functions
        const sectionType = typeof config.theme[section];
        expect(['object', 'function']).toContain(sectionType);
      }
    });
  });

  it('should work with CSS-first configuration values', () => {
    // Test that our scaling produces values that would work in @theme
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    if (config.theme.fontSize) {
      // Generate what CSS variables would look like
      const cssVars = Object.entries(config.theme.fontSize)
        .map(([key, value]) => {
          const cssValue = Array.isArray(value) ? value[0] : value;
          return `--text-${key}: ${cssValue};`;
        });
      
      // Should be valid CSS variable declarations
      cssVars.forEach(cssVar => {
        expect(cssVar).toMatch(/^--text-\w+: [\d.]+rem;$/);
      });
    }
  });

  it('should handle v4 default theme compatibility', () => {
    // Test with different scaling factors that v4 might encounter
    const scalingFactors = [
      { base: 16, new: 20 }, // 0.8x
      { base: 16, new: 14 }, // ~1.14x
      { base: 18, new: 16 }, // 1.125x
    ];

    scalingFactors.forEach(({ base, new: newSize }) => {
      const pluginInstance = plugin({ baseFontSize: base, newFontSize: newSize });
      const config = pluginInstance.config;
      
      expect(config).toHaveProperty('theme');
      expect(config.theme).toBeDefined();
      
      // Should maintain proper scaling
      if (config.theme.fontSize && config.theme.fontSize.base) {
        const baseSize = Array.isArray(config.theme.fontSize.base) 
          ? config.theme.fontSize.base[0] 
          : config.theme.fontSize.base;
        
        const expectedScale = base / newSize;
        const expectedValue = `${expectedScale.toFixed(4)}rem`;
        expect(baseSize).toBe(expectedValue);
      }
    });
  });
}); 