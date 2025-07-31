# ClinicChat Development Guide

## Project Overview
ClinicChat is a HIPAA-compliant chatbot system for medical practices, built with a React.js frontend and Node.js/Express backend in a monorepo structure.

## Project Structure
```
clinicchat/
├── frontend/          # React.js TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js/Express TypeScript backend  
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── package.json       # Root workspace configuration
```

## Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm (comes with Node.js)
- Git

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

### Development Commands

#### Frontend
```bash
cd frontend
npm run dev        # Start development server
npm test          # Run unit tests
npm run build     # Build for production
```

#### Backend
```bash
cd backend
npm run dev       # Start development server with hot reload
npm test          # Run unit tests
npm run test:integration  # Run integration tests
npm run test:e2e  # Run end-to-end tests
npm run build     # Build for production
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pipeline Steps
1. **Setup**: Node.js 18.x and 20.x matrix
2. **Install**: Dependencies for root, frontend, and backend
3. **Test**: Unit, integration, and e2e tests
4. **Build**: Production builds for both frontend and backend

### Configuration
- Pipeline configuration: `.github/workflows/ci.yml`
- Runs on Ubuntu latest
- Uses npm cache for faster builds
- Tests multiple Node.js versions for compatibility

## Development Workflow

1. **Feature Development**:
   - Create feature branch from `develop`
   - Implement changes with tests
   - Ensure CI pipeline passes

2. **Code Quality**:
   - TypeScript for type safety
   - Jest/Vitest for testing
   - ESLint for code consistency

3. **Deployment**:
   - Merge to `develop` for staging
   - Merge to `main` for production
   - Automated deployment via CI/CD

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: Full page/feature testing
- **E2E Tests**: User journey testing

### Backend Testing  
- **Unit Tests**: Function and service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflow testing

## Security Considerations

- HIPAA compliance requirements
- JWT-based authentication
- Data encryption in transit and at rest
- Regular security audits

## Getting Help

- Check existing issues in the repository
- Review this documentation
- Contact the development team

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Ensure CI pipeline passes
4. Create clear, descriptive commit messages 