# ClinicChat: AI-Powered Medical Receptionist & Care Coordinator

## Overview
ClinicChat is an intelligent chatbot system for dental and aesthetic medicine practices, providing professional patient interaction, appointment management, follow-up care, and comprehensive patient support.

## Core Features
- Real-time chat interface (web)
- Multi-language support
- Appointment scheduling
- Patient follow-up automation
- Medical advisory capabilities
- Security & compliance (HIPAA, encryption)

## Tech Stack
- Frontend: React.js (TypeScript)
- Backend: Node.js (Express)
- Database: PostgreSQL, MongoDB
- AI/ML: OpenAI GPT-4 or similar
- Real-time: WebSocket

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL
- MongoDB

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/prageethmgunathilaka/clinicchat.git
   cd clinicchat
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` and fill in required values.
4. Start the development servers:
   ```sh
   npm run dev
   ```

## Testing

### Unit Tests
- Run all unit tests:
  ```sh
  npm run test:unit
  ```

### Integration Tests
- Run all integration tests:
  ```sh
  npm run test:integration
  ```

### End-to-End (E2E) Tests
- Run E2E tests:
  ```sh
  npm run test:e2e
  ```

### Continuous Integration
- All tests are run on every push via GitHub Actions
- CI/CD pipeline configuration: `.github/workflows/ci.yml`
- Tests run on Node.js 18.x and 20.x matrix
- Automated builds for both frontend and backend

## Project Structure
```
clinicchat/
├── frontend/          # React.js TypeScript frontend
├── backend/           # Node.js/Express TypeScript backend  
├── docs/              # Project documentation
└── .github/           # CI/CD workflows
```

## Documentation
- [Development Guide](docs/DEVELOPMENT.md) - Detailed setup, workflow, and contribution guidelines
- [Product Requirements](prd.md) - Comprehensive project specifications

## Contributing
- Please see [Development Guide](docs/DEVELOPMENT.md) for detailed guidelines
- Follow the established code style and testing practices

## License
MIT Trigger deployment test
