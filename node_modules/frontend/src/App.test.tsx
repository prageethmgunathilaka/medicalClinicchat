import { render, screen } from '@testing-library/react';
import App from './App';

import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders chat UI placeholder', () => {
    render(<App />);
    expect(screen.getByText('ClinicChat')).not.to.be.undefined;
    expect(screen.getByPlaceholderText('Type your message...')).not.to.be.undefined;
  });
}); 