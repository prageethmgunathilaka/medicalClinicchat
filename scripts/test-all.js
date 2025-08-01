#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Comprehensive test runner for Medical Clinic Chat application
 * Runs all types of tests: unit, integration, and end-to-end
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}▷ ${description}${colors.reset}`);
    log(`${colors.yellow}Command: ${command} ${args.join(' ')}${colors.reset}`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        log(`${colors.green}✓ ${description} - PASSED${colors.reset}`);
        resolve(code);
      } else {
        log(`${colors.red}✗ ${description} - FAILED (exit code: ${code})${colors.reset}`);
        reject(new Error(`${description} failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      log(`${colors.red}✗ ${description} - ERROR: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

async function installDependencies() {
  log(`${colors.bright}🔧 Installing Dependencies${colors.reset}`);
  try {
    await runCommand('npm', ['install'], process.cwd(), 'Installing root dependencies');
    await runCommand('npm', ['install'], path.join(process.cwd(), 'backend'), 'Installing backend dependencies');
    await runCommand('npm', ['install'], path.join(process.cwd(), 'frontend'), 'Installing frontend dependencies');
    log(`${colors.green}✓ All dependencies installed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}✗ Failed to install dependencies${colors.reset}`);
    throw error;
  }
}

async function runUnitTests() {
  log(`${colors.bright}\n📋 Running Unit Tests${colors.reset}`);
  try {
    await runCommand('npm', ['run', 'test:unit'], path.join(process.cwd(), 'backend'), 'Backend unit tests');
    await runCommand('npm', ['run', 'test:unit'], path.join(process.cwd(), 'frontend'), 'Frontend unit tests');
    log(`${colors.green}✓ All unit tests passed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}✗ Unit tests failed${colors.reset}`);
    throw error;
  }
}

async function runIntegrationTests() {
  log(`${colors.bright}\n🔄 Running Integration Tests${colors.reset}`);
  try {
    await runCommand('npm', ['run', 'test:integration'], path.join(process.cwd(), 'backend'), 'Backend integration tests');
    await runCommand('npm', ['run', 'test:integration'], path.join(process.cwd(), 'frontend'), 'Frontend integration tests');
    log(`${colors.green}✓ All integration tests passed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}✗ Integration tests failed${colors.reset}`);
    throw error;
  }
}

async function runE2ETests() {
  log(`${colors.bright}\n🌐 Running End-to-End Tests${colors.reset}`);
  try {
    await runCommand('npm', ['run', 'test:e2e'], path.join(process.cwd(), 'frontend'), 'End-to-end tests with Playwright');
    log(`${colors.green}✓ All E2E tests passed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}✗ E2E tests failed${colors.reset}`);
    throw error;
  }
}

async function generateTestReport() {
  log(`${colors.bright}\n📊 Generating Test Reports${colors.reset}`);
  
  const reports = [
    'Backend unit test results',
    'Backend integration test results', 
    'Frontend unit test results',
    'Frontend integration test results',
    'End-to-end test results'
  ];

  log(`${colors.cyan}Test execution completed!${colors.reset}`);
  log(`${colors.yellow}Reports available:${colors.reset}`);
  reports.forEach(report => log(`  • ${report}`));
}

async function main() {
  const startTime = Date.now();
  
  log(`${colors.bright}🧪 Medical Clinic Chat - Comprehensive Test Suite${colors.reset}`);
  log(`${colors.cyan}Starting comprehensive test execution...${colors.reset}\n`);

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const skipInstall = args.includes('--skip-install');
    const testType = args.find(arg => ['unit', 'integration', 'e2e'].includes(arg));

    if (!skipInstall) {
      await installDependencies();
    }

    // Run specific test type or all tests
    if (testType === 'unit') {
      await runUnitTests();
    } else if (testType === 'integration') {
      await runIntegrationTests();
    } else if (testType === 'e2e') {
      await runE2ETests();
    } else {
      // Run all tests in sequence
      await runUnitTests();
      await runIntegrationTests();
      await runE2ETests();
    }

    await generateTestReport();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n${colors.green}${colors.bright}🎉 All tests completed successfully!${colors.reset}`);
    log(`${colors.cyan}Total execution time: ${duration}s${colors.reset}`);
    
    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n${colors.red}${colors.bright}❌ Test suite failed!${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    log(`${colors.cyan}Execution time: ${duration}s${colors.reset}`);
    
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log(`\n${colors.yellow}⚠️  Test execution interrupted${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log(`\n${colors.yellow}⚠️  Test execution terminated${colors.reset}`);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 