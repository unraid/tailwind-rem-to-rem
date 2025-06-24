#!/usr/bin/env node

/**
 * Plugin functionality tests for @unraid/tailwind-rem-to-rem
 * Tests core plugin functionality and Tailwind v4 compatibility
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

let plugin, scaleRemFactor;

beforeAll(async () => {
  // Import plugin and utils
  const pluginModule = await import(join(projectRoot, 'src/index.ts'));
  const utilsModule = await import(join(projectRoot, 'src/utils.ts'));
  
  plugin = pluginModule.default;
  scaleRemFactor = utilsModule.scaleRemFactor;
});

describe('Plugin Structure', () => {
  it('should export a function', () => {
    expect(typeof plugin).toBe('function');
  });

  it('should be a Tailwind plugin with options', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    expect(typeof pluginInstance).toBe('object');
    
    // Check that it has the essential plugin properties
    expect(pluginInstance).toHaveProperty('config');
    
    // Test the config function that returns theme
    const config = pluginInstance.config;
    expect(config).toHaveProperty('theme');
    expect(typeof config.theme).toBe('object');
  });

  it('should throw error for invalid font sizes', () => {
    expect(() => plugin({ baseFontSize: 0, newFontSize: 20 }))
      .toThrow('Font sizes must be positive numbers');
    
    expect(() => plugin({ baseFontSize: 16, newFontSize: -5 }))
      .toThrow('Font sizes must be positive numbers');
  });
});

describe('Rem Scaling Function', () => {
  const testCases = [
    {
      input: '1rem',
      baseFontSize: 16,
      newFontSize: 20,
      expected: '0.8000rem', // 16/20 = 0.8
      description: 'should scale 1rem from 16px to 20px base'
    },
    {
      input: '1.5rem',
      baseFontSize: 16,
      newFontSize: 12,
      expected: '2.0000rem', // 16/12 = 1.333... * 1.5 = 2
      description: 'should scale 1.5rem from 16px to 12px base'
    },
    {
      input: '0.875rem',
      baseFontSize: 16,
      newFontSize: 20,
      expected: '0.7000rem', // 16/20 * 0.875 = 0.7
      description: 'should scale fractional rem values'
    }
  ];

  testCases.forEach(({ input, baseFontSize, newFontSize, expected, description }) => {
    it(description, () => {
      const result = scaleRemFactor(input, baseFontSize, newFontSize);
      expect(result).toBe(expected);
    });
  });

  it('should handle non-rem values unchanged', () => {
    expect(scaleRemFactor('16px', 16, 20)).toBe('16px');
    expect(scaleRemFactor('100%', 16, 20)).toBe('100%');
    expect(scaleRemFactor('auto', 16, 20)).toBe('auto');
  });

  it('should handle arrays', () => {
    const input = ['1rem', '2rem', '16px'];
    const result = scaleRemFactor(input, 16, 20);
    expect(result).toEqual(['0.8000rem', '1.6000rem', '16px']);
  });

  it('should handle objects', () => {
    const input = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
      pixel: '16px'
    };
    const result = scaleRemFactor(input, 16, 20);
    expect(result).toEqual({
      small: '0.7000rem',
      medium: '0.8000rem', 
      large: '1.0000rem',
      pixel: '16px'
    });
  });

  it('should handle null and undefined', () => {
    expect(scaleRemFactor(null, 16, 20)).toBe(null);
    expect(scaleRemFactor(undefined, 16, 20)).toBe(undefined);
  });

  it('should handle functions', () => {
    // Test function that uses rem values in its arguments
    const mockFn = (val) => val; // Just return the value
    const result = scaleRemFactor(mockFn, 16, 20);
    
    expect(typeof result).toBe('function');
    // Test that the function scales rem values passed to it
    const output = result('1rem');
    expect(output).toBe('0.8000rem'); // 1rem * (16/20) = 0.8rem
  });
});

describe('Theme Integration', () => {
  it('should return scaled theme configuration', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    expect(config).toHaveProperty('theme');
    expect(typeof config.theme).toBe('object');
  });

  it('should preserve theme structure', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    // Check that common theme properties exist
    expect(config.theme).toHaveProperty('fontSize');
    expect(config.theme).toHaveProperty('spacing');
    expect(config.theme).toHaveProperty('borderRadius');
  });

  it('should scale fontSize values', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    // Default Tailwind has text-base as 1rem, should become 0.8rem
    if (config.theme.fontSize && config.theme.fontSize.base) {
      const baseSize = Array.isArray(config.theme.fontSize.base) 
        ? config.theme.fontSize.base[0] 
        : config.theme.fontSize.base;
      expect(baseSize).toBe('0.8000rem');
    }
  });

  it('should scale spacing values', () => {
    const pluginInstance = plugin({ baseFontSize: 16, newFontSize: 20 });
    const config = pluginInstance.config;
    
    // Check that spacing is scaled
    if (config.theme.spacing && config.theme.spacing['4']) {
      expect(config.theme.spacing['4']).toBe('0.8000rem'); // 1rem * 0.8
    }
  });
});

describe('Tailwind v4 Compatibility', () => {
  it('should work with different scale factors', () => {
    const testConfigs = [
      { baseFontSize: 16, newFontSize: 18 }, // 16/18 = 0.8889
      { baseFontSize: 16, newFontSize: 14 }, // 16/14 = 1.1429
      { baseFontSize: 18, newFontSize: 16 }, // 18/16 = 1.125
    ];

    testConfigs.forEach(({ baseFontSize, newFontSize }) => {
      expect(() => plugin({ baseFontSize, newFontSize })).not.toThrow();
      
      const pluginInstance = plugin({ baseFontSize, newFontSize });
      const config = pluginInstance.config;
      expect(config).toHaveProperty('theme');
    });
  });

  it('should handle edge cases gracefully', () => {
    // Same font sizes (no scaling needed)
    const noScaleInstance = plugin({ baseFontSize: 16, newFontSize: 16 });
    expect(noScaleInstance.config).toHaveProperty('theme');
    
    // Very different font sizes
    const extremeInstance = plugin({ baseFontSize: 12, newFontSize: 24 });
    expect(extremeInstance.config).toHaveProperty('theme');
  });

  it('should maintain precision for complex scaling', () => {
    const precisionTest = scaleRemFactor('1.125rem', 16, 18);
    // 1.125 * (16/18) = 1
    expect(precisionTest).toBe('1.0000rem');
  });
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Plugin Tests...\n');
  
  // Simple test runner for Node.js without external dependencies
  const results = { passed: 0, failed: 0, total: 0 };
  
  try {
    // Import and run basic functionality test
    const pluginModule = await import(join(projectRoot, 'src/index.ts'));
    const utilsModule = await import(join(projectRoot, 'src/utils.ts'));
    
    console.log('✅ Plugin imports successfully');
    
    // Test basic functionality
    const testPlugin = pluginModule.default;
    const testScaleRemFactor = utilsModule.scaleRemFactor;
    
    // Test 1: Plugin structure
    console.log('\n📋 Testing plugin structure...');
    if (typeof testPlugin !== 'function') {
      throw new Error('Plugin should export a function');
    }
    console.log('✅ Plugin exports function');
    
    // Test 2: Basic scaling
    console.log('\n🔢 Testing rem scaling...');
    const scaled = testScaleRemFactor('1rem', 16, 20);
    if (scaled !== '0.8000rem') {
      throw new Error(`Expected '0.8000rem', got '${scaled}'`);
    }
    console.log('✅ Rem scaling works correctly');
    
    // Test 3: Plugin configuration
    console.log('\n⚙️  Testing plugin configuration...');
    const config = testPlugin({ baseFontSize: 16, newFontSize: 20 });
    if (!config || !config.theme) {
      throw new Error('Plugin should return config with theme');
    }
    console.log('✅ Plugin configuration works');
    
    // Test 4: Error handling
    console.log('\n🚫 Testing error handling...');
    try {
      testPlugin({ baseFontSize: 0, newFontSize: 20 });
      throw new Error('Should have thrown error for invalid font size');
    } catch (error) {
      if (!error.message.includes('Font sizes must be positive numbers')) {
        throw error;
      }
    }
    console.log('✅ Error handling works');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
} 