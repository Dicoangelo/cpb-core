# Contributing to CPB Core

Thank you for your interest in contributing to Cognitive Precision Bridge!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Dicoangelo/cpb-core.git
cd cpb-core

# Install dependencies
npm install

# Run in watch mode
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

## Project Structure

```
src/
├── index.ts        # Main exports
├── types.ts        # TypeScript interfaces
├── router.ts       # Path selection logic
└── orchestrator.ts # Main CPB coordinator
```

## Adding a New Feature

1. **Fork & Branch**: Create a feature branch from `main`
2. **Types First**: Add interfaces to `types.ts`
3. **Implement**: Add logic to appropriate module
4. **Test**: Add tests in `__tests__/`
5. **Document**: Update README if API changes
6. **PR**: Open a pull request with description

## Code Style

- TypeScript strict mode
- Functional style preferred
- Document public APIs with JSDoc
- Keep functions focused and small

## Commit Messages

Follow conventional commits:

```
feat: Add new execution path
fix: Handle edge case in router
docs: Update API reference
test: Add router unit tests
```

## Pull Request Process

1. Ensure tests pass: `npm test`
2. Ensure types check: `npm run typecheck`
3. Ensure lint passes: `npm run lint`
4. Update documentation if needed
5. Request review from maintainers

## Questions?

Open an issue for questions or discussions.
