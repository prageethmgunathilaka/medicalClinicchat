# Medical Clinic Chat - Testing Documentation

This document outlines the comprehensive testing strategy for the Medical Clinic Chat application, including unit tests, integration tests, and end-to-end tests.

## 🧪 Testing Strategy

Our testing approach follows the **Testing Pyramid** principle:

```
       🌐 E2E Tests (Few)
     ↗️ Integration Tests (Some)
   ↗️     Unit Tests (Many)
```

### Test Types Overview

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how different parts work together  
3. **End-to-End Tests** - Test complete user workflows in a real browser

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# End-to-end tests only
npm run test:e2e
```

### Development Mode
```bash
# Watch mode for unit tests
npm run test:watch

# Coverage reports
npm run test:coverage

# CI mode (skip install)
npm run test:ci
```

## 📋 Backend Tests

### Unit Tests
**Location**: `backend/src/__tests__/*.unit.test.ts`
**Framework**: Jest + Supertest

**Coverage**:
- Health check endpoint validation
- Basic Express app setup
- Error handling

**Example**:
```bash
cd backend && npm run test:unit
```

### Integration Tests
**Location**: `backend/src/__tests__/*.int.test.ts`
**Framework**: Jest + Supertest + Socket.IO Client

**Coverage**:
- **API Endpoints**:
  - Health check functionality
  - Message processing with OpenAI integration
  - Multi-language support (English/Sinhala)
  - Error handling and timeouts
  - CORS validation
  - Input validation and security

- **WebSocket Communication**:
  - Real-time chat message flow
  - Multi-client broadcasting  
  - Connection management
  - Language-specific responses
  - Error scenarios and recovery
  - Performance under load

**Key Test Scenarios**:
- ✅ OpenAI API integration (mocked)
- ✅ Medical receptionist context validation
- ✅ Sinhala language processing
- ✅ Concurrent request handling
- ✅ Network failure recovery
- ✅ Security validations

## 🎨 Frontend Tests

### Unit Tests
**Location**: `frontend/src/__tests__/*.test.tsx`
**Framework**: Vitest + React Testing Library

**Coverage**:
- Component rendering
- User interactions
- State management
- Props validation

### Integration Tests  
**Location**: `frontend/src/__tests__/*.integration.test.tsx`
**Framework**: Vitest + React Testing Library + Socket.IO

**Coverage**:
- **UI Components**:
  - Chat interface rendering
  - Message input and display
  - Language switcher functionality
  - Loading states and indicators
  - Accessibility compliance

- **Real-time Features**:
  - Socket.IO client integration
  - Message sending/receiving
  - Auto-scrolling behavior
  - Connection error handling

- **Internationalization**:
  - Language switching
  - Multi-language message handling
  - Translation accuracy

**Key Test Scenarios**:
- ✅ Chat message flow with mock Socket.IO server
- ✅ Language switching between English and Sinhala
- ✅ Responsive design across viewports
- ✅ Keyboard navigation and accessibility
- ✅ Error handling and recovery
- ✅ Performance with multiple messages

## 🌐 End-to-End Tests

**Location**: `frontend/tests/e2e/*.spec.ts`
**Framework**: Playwright
**Browsers**: Chrome, Firefox, Safari, Edge + Mobile

### Test Coverage

#### 🎯 Core Functionality
- Complete chat workflows
- Real-time message exchange
- Multi-language communication
- Medical context validation

#### 🔒 User Experience  
- Loading performance
- Responsive design
- Accessibility compliance
- Error handling

#### 🌍 Cross-Platform
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Different viewport sizes
- Network conditions

#### 🏥 Medical Context
- Dental appointment requests
- Aesthetic medicine inquiries  
- General health questions
- Professional response validation

### Key E2E Scenarios

```typescript
// Example test structure
test('should handle complete appointment booking flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[placeholder="Type your message..."]', 'I need a dental cleaning');
  await page.click('button:has-text("Send")');
  
  // Verify user message appears
  await expect(page.locator('.chat-bubble.user')).toContainText('dental cleaning');
  
  // Verify bot response with medical context
  await expect(page.locator('.chat-bubble.bot')).toBeVisible({ timeout: 30000 });
});
```

## 🔧 Test Configuration

### Backend Configuration

**Jest Unit Tests** (`jest.unit.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
};
```

**Jest Integration Tests** (`jest.integration.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.int.test.ts'],
};
```

### Frontend Configuration

**Vitest** (`vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 10000,
  },
});
```

**Playwright** (`playwright.config.ts`):
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    { command: 'npm run dev --workspace=backend', port: 4000 },
    { command: 'npm run dev --workspace=frontend', port: 3000 },
  ],
});
```

## 🎯 Test Scenarios Coverage

### ✅ Authentication & Security
- API key protection (removed from git history)
- CORS validation
- Input sanitization
- Error message safety

### ✅ Multi-language Support
- English ↔ Sinhala switching
- Language-specific AI responses
- UI translation accuracy
- Character encoding handling

### ✅ Real-time Communication
- WebSocket connection establishment
- Message broadcasting
- Connection failure recovery
- Multi-client synchronization

### ✅ Medical Context
- Professional receptionist responses
- Appointment scheduling workflows
- Aesthetic medicine inquiries
- Privacy and confidentiality rules

### ✅ Performance & Reliability
- Concurrent user handling
- Message queue processing
- Memory leak prevention
- Load testing scenarios

### ✅ Accessibility
- Screen reader compatibility
- Keyboard navigation
- ARIA labels and roles
- Color contrast compliance

### ✅ Cross-browser Compatibility
- Chrome, Firefox, Safari, Edge
- Mobile Safari and Chrome
- Different viewport sizes
- Feature detection and fallbacks

## 📊 Test Reports

After running tests, reports are available in:

- **Backend**: `backend/coverage/` (coverage reports)
- **Frontend**: `frontend/coverage/` (coverage reports)
- **E2E**: `frontend/test-results/` (Playwright reports)
- **Screenshots**: `frontend/test-results/` (failure screenshots)
- **Videos**: `frontend/test-results/` (failure videos)

## 🚨 Troubleshooting

### Common Issues

#### Tests Timing Out
```bash
# Increase timeout for AI responses
# E2E tests have 30s timeout for OpenAI calls
await expect(page.locator('.chat-bubble.bot')).toBeVisible({ timeout: 30000 });
```

#### Socket.IO Connection Issues
```bash
# Ensure backend is running before frontend tests
npm run dev --workspace=backend
# Wait for "Backend listening on port 4000"
```

#### Environment Variables
```bash
# Create .env file with test API keys
cp .env.example .env
# Add your OPENAI_API_KEY for integration tests
```

#### Port Conflicts
```bash
# Kill processes on test ports
npx kill-port 3000 4000
```

### Debug Mode

```bash
# Run tests with verbose output
DEBUG=* npm test

# Run specific test file
npx jest backend/src/__tests__/api.integration.test.ts

# Run E2E tests in headed mode
npx playwright test --headed

# Record new Playwright tests
npx playwright codegen localhost:3000
```

## 📈 Continuous Integration

The test suite is designed for CI/CD environments:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v1
  
- name: Upload Playwright Report
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: frontend/test-results/
```

## 🔄 Test Maintenance

### Adding New Tests

1. **Unit Tests**: Add to appropriate `__tests__` directory
2. **Integration Tests**: Use `.int.test.ts` suffix
3. **E2E Tests**: Add to `frontend/tests/e2e/`

### Best Practices

- ✅ Test user workflows, not implementation details
- ✅ Use realistic test data and scenarios
- ✅ Mock external dependencies (OpenAI API)
- ✅ Clean up resources after tests
- ✅ Write descriptive test names
- ✅ Group related tests in describe blocks
- ✅ Use proper assertions and matchers

### Performance Guidelines

- Unit tests: `< 100ms` per test
- Integration tests: `< 5s` per test  
- E2E tests: `< 60s` per test
- Total suite: `< 10 minutes`

## 📚 Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Socket.IO Testing](https://socket.io/docs/v4/testing/)

---

## 🎉 Summary

This comprehensive test suite ensures the Medical Clinic Chat application is:

- **Reliable**: Thoroughly tested across all layers
- **Performant**: Optimized for real-world usage
- **Accessible**: Compliant with web standards  
- **Secure**: Protected against common vulnerabilities
- **International**: Supporting multiple languages
- **Professional**: Meeting medical industry standards

Run `npm test` to execute the full test suite and verify application quality! 🚀 