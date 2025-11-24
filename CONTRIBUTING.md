# Contributing to iQ-auth

Дякуємо за ваш інтерес до проекту iQ-auth! 🇺🇦

## Code of Conduct

Будь ласка, поважайте один одного та дотримуйтеся професійної етики.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Development Setup

```bash
# Clone repository
git clone https://github.com/010-io/iQ-auth.git
cd iQ-auth

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Project Structure

```
iQ-auth/
├── packages/
│   ├── core/          # @iq-auth/core - Core engine
│   ├── sdk/           # @iq-auth/sdk - High-level SDK
│   ├── cli/           # @iq-auth/cli - CLI tool
│   ├── ai-assistant/  # @iq-auth/ai - AI integration
│   └── plugins/       # Authentication plugins
├── docs/              # Documentation
├── examples/          # Usage examples
└── scripts/           # Build and automation scripts
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following our [style guide](#code-style)
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
pnpm test
pnpm lint
pnpm typecheck
```

### 4. Commit Changes

Use conventional commit messages:

```
feat: add new authentication provider
fix: resolve token validation issue
docs: update README with examples
test: add unit tests for plugin loader
chore: update dependencies
```

### 5. Submit Pull Request

- Push your branch to GitHub
- Create a Pull Request with clear description
- Link related issues
- Wait for review

## Code Style

### TypeScript

- Use strict TypeScript mode
- Prefer explicit types over `any`
- Use interfaces for public APIs
- Use types for internal structures

### Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Linting

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Testing

### Writing Tests

- Place tests next to source files: `*.test.ts`
- Aim for >85% code coverage
- Test edge cases and error conditions

```typescript
import { IQAuth } from '../index';

describe('IQAuth', () => {
  it('should initialize correctly', () => {
    const auth = new IQAuth();
    expect(auth).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## Documentation

- Update README.md for package-level changes
- Update docs/ for architectural changes
- Add JSDoc comments for public APIs
- Provide usage examples

## Plugin Development

To create a new authentication plugin:

1. Create plugin directory: `packages/plugins/your-plugin/`
2. Implement `IAuthPlugin` interface
3. Add package.json and README.md
4. Write tests
5. Submit PR

See [`packages/plugins/fido2/`](packages/plugins/fido2) for example.

## Versioning

We use a custom auto-versioning system based on CREATOR_SEED and VERSION_SEED.

```bash
# Bump version
pnpm bump-version
```

## Release Process

1. Ensure all tests pass
2. Update CHANGELOG.md
3. Run version bump script
4. Create PR to `main` branch
5. After merge, GitHub Actions will publish packages

## Questions?

- Open an issue on GitHub
- Contact: Igor Omelchenko (010io)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Слава Україні!** 🇺🇦
