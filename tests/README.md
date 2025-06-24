# Tests

This directory contains comprehensive tests for the Tailwind rem plugin using [Vitest](https://vitest.dev/).

## Test Structure

- `plugin.test.js` - Core plugin functionality tests
- `tailwind-v4.test.js` - Tailwind v4 compatibility tests

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests with coverage

```bash
npm run test:coverage
```

## Test Categories

### Plugin Structure Tests

- Verifies the plugin exports correctly
- Tests plugin.withOptions structure
- Validates error handling for invalid inputs

### Rem Scaling Function Tests

- Tests scaling of rem values with different ratios
- Handles non-rem values (px, %, auto)
- Tests array and object processing
- Validates function argument scaling

### Theme Integration Tests

- Verifies scaled theme configuration
- Tests preservation of theme structure
- Validates fontSize and spacing scaling

### Tailwind v4 Compatibility Tests

- Tests plugin structure compatibility with v4
- Validates CSS variable generation
- Tests different scaling factors
- Ensures theme structure works with v4

## CI/CD Integration

Tests run automatically on:

- Pull requests to main branch
- Pushes to main branch
- Multiple Node.js versions (18, 20, 22)
- Both Tailwind v3 and v4 compatibility

## Coverage

Test coverage reports are generated and uploaded to Codecov on CI runs. You can view coverage locally by running:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.
