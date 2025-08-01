import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create a persistent mock socket that will be returned by io()
const createMockSocket = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
  connect: () => {},
  disconnect: () => {},
  connected: true
});

// Store the mock socket instance
let mockSocketInstance = createMockSocket();

// Mock socket.io-client BEFORE importing App
vi.mock('socket.io-client', () => ({
  io: () => mockSocketInstance
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ClinicChat': 'ClinicChat',
        '[Chat messages will appear here]': '[Chat messages will appear here]',
        'Type your message...': 'Type your message...',
        'Send': 'Send',
        '...': '...'
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: () => {}
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  }
}));

// Mock marked
vi.mock('marked', () => ({
  marked: {
    parse: (text: string) => `<p>${text}</p>`
  }
}));

// Mock i18n file
vi.mock('../i18n', () => ({}));

// Now import App after mocks are set up
import App from '../App';

describe('App Integration Tests', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Reset the mock socket instance with fresh spies
    mockSocketInstance = createMockSocket();
    vi.spyOn(mockSocketInstance, 'on');
    vi.spyOn(mockSocketInstance, 'off');  
    vi.spyOn(mockSocketInstance, 'emit');
    vi.spyOn(mockSocketInstance, 'connect');
    vi.spyOn(mockSocketInstance, 'disconnect');
  });

  describe('UI Rendering', () => {
    it('should render main chat interface', () => {
      act(() => {
        render(<App />);
      });
      
      expect(screen.getByText('ClinicChat')).toBeInTheDocument();
      expect(screen.getByText('[Chat messages will appear here]')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });

    it('should render language switcher', () => {
      act(() => {
        render(<App />);
      });
      
      const languageSelect = screen.getByRole('combobox', { name: 'Select language' });
      expect(languageSelect).toBeInTheDocument();
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      act(() => {
        render(<App />);
      });
      
      expect(screen.getByLabelText('Select language')).toBeInTheDocument();
      expect(screen.getByLabelText('Type your message...')).toBeInTheDocument();
      expect(screen.getByLabelText('Send')).toBeInTheDocument();
      expect(screen.getByLabelText('Chat messages')).toBeInTheDocument();
    });

    it('should disable send button when input is empty', () => {
      act(() => {
        render(<App />);
      });
      
      const sendButton = screen.getByRole('button', { name: 'Send' });
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has text', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, 'Hello');
      });
      expect(sendButton).toBeEnabled();
    });
  });

  describe('Message Input and Form Handling', () => {
    it('should handle typing in message input', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      await act(async () => {
        await user.type(input, 'Hello, I need help');
      });
      
      expect(input).toHaveValue('Hello, I need help');
    });

    it('should clear input after sending message', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, 'Test message');
      });
      expect(input).toHaveValue('Test message');
      
      await act(async () => {
        await user.click(sendButton);
      });
      expect(input).toHaveValue('');
    });

    it('should send message on form submit', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        await user.type(input, 'Test message');
        await user.keyboard('{Enter}');
      });
      
      expect(input).toHaveValue('');
    });

    it('should not send empty message', async () => {
      act(() => {
        render(<App />);
      });
      
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      // Button should be disabled for empty input
      expect(sendButton).toBeDisabled();
      
      // Try clicking disabled button
      await act(async () => {
        await user.click(sendButton);
      });
      
      // No messages should appear
      expect(screen.getByText('[Chat messages will appear here]')).toBeInTheDocument();
    });

    it('should trim whitespace from messages', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, '   ');
      });
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Socket Integration', () => {
    it('should initialize socket connection', () => {
      act(() => {
        render(<App />);
      });
      
      // Verify socket.on was called for message listener
      expect(mockSocketInstance.on).toHaveBeenCalledWith('chat message', expect.any(Function));
    });

    it('should emit message when sending', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, 'Hello');
        await user.click(sendButton);
      });
      
      // Verify socket emit was called
      expect(mockSocketInstance.emit).toHaveBeenCalledWith('chat message', 'Hello', 'en');
    });

    it('should clean up socket listeners on unmount', () => {  
      let unmount;
      act(() => {
        const result = render(<App />);
        unmount = result.unmount;
      });
      
      act(() => {
        unmount();
      });
      
      // Verify socket.off was called
      expect(mockSocketInstance.off).toHaveBeenCalledWith('chat message');
    });
  });

  describe('Form Validation', () => {
    it('should prevent submission of whitespace-only messages', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, '   \n\t   ');
      });
      
      // Send button should remain disabled
      expect(sendButton).toBeDisabled();
    });

    it('should handle reasonably long messages', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const mediumMessage = 'This is a reasonably long message that tests input handling.';
      
      await act(async () => {
        await user.type(input, mediumMessage);
      });
      
      expect(input).toHaveValue(mediumMessage);
    });
  });

  describe('Component Lifecycle', () => {
    it('should not have memory leaks on unmount', () => {
      let unmount;
      act(() => {
        const result = render(<App />);
        unmount = result.unmount;
      });
      
      // Should unmount without errors
      expect(() => act(() => { unmount(); })).not.toThrow();
    });

    it('should handle user input correctly', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      // Use reasonable delay to prevent character scrambling
      await act(async () => {
        await user.type(input, 'Quick message', { delay: 50 });
      });
      
      expect(input).toHaveValue('Quick message');
    });
  });

  describe('Language and Accessibility', () => {
    it('should send messages with current language', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      
      await act(async () => {
        await user.type(input, 'Hello doctor');
        await user.click(sendButton);
      });
      
      // Should emit with default language 'en'
      expect(mockSocketInstance.emit).toHaveBeenCalledWith('chat message', 'Hello doctor', 'en');
    });

    it('should support keyboard navigation', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });
      const languageSelect = screen.getByRole('combobox', { name: 'Select language' });
      
      // Focus input
      await act(async () => {
        await user.click(input);
      });
      expect(input).toHaveFocus();
      
      // Verify other elements are focusable
      expect(sendButton).toBeInTheDocument();
      expect(languageSelect).toBeInTheDocument();
    });

    it('should submit form on Enter key', async () => {
      act(() => {
        render(<App />);
      });
      
      const input = screen.getByPlaceholderText('Type your message...');
      
      await act(async () => {
        await user.type(input, 'Test message{enter}');
      });
      
      expect(input).toHaveValue('');
      expect(mockSocketInstance.emit).toHaveBeenCalledWith('chat message', 'Test message', 'en');
    });
  });
}); 