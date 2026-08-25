import React from 'react';
import { LoginScreen } from '../features/auth/LoginScreen';
import { OpeningScreen } from '../features/opening/OpeningScreen';
import { CheckingScreen } from '../features/opening/CheckingScreen';
import { posReducer, initialPosState, usePosState, usePosDerived, usePosActions } from '../state/PosContext';
import RootLayout from '../../app/_layout';
import PosShellLayout from '../../app/(pos)/_layout';

describe('Task 3: Auth, Opening, Checking Screens & Navigation Flow', () => {
  describe('Component Exports & Interface Definitions', () => {
    test('LoginScreen is defined and exports correctly', () => {
      expect(LoginScreen).toBeDefined();
      const element = React.createElement(LoginScreen, { onLoginSuccess: jest.fn() });
      expect(element).toBeDefined();
    });

    test('OpeningScreen is defined and exports correctly', () => {
      expect(OpeningScreen).toBeDefined();
      const element = React.createElement(OpeningScreen, {
        onContinueToConfirm: jest.fn(),
        onBack: jest.fn(),
      });
      expect(element).toBeDefined();
    });

    test('CheckingScreen is defined and exports correctly', () => {
      expect(CheckingScreen).toBeDefined();
      const element = React.createElement(CheckingScreen, {
        type: 'opening',
        onComplete: jest.fn(),
        onCancel: jest.fn(),
      });
      expect(element).toBeDefined();
    });
  });

  describe('Context and Layout Provider Integration', () => {
    test('usePosState, usePosDerived, and usePosActions throw outside PosProvider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        usePosState();
      }).toThrow();
      expect(() => {
        usePosDerived();
      }).toThrow();
      expect(() => {
        usePosActions();
      }).toThrow();
      spy.mockRestore();
    });

    test('app/_layout.tsx wraps root navigation tree with a single PosProvider', () => {
      const element = RootLayout();
      expect(element).toBeDefined();
      expect(element.type?.name).toBe('PosProvider');
    });

    test('app/(pos)/_layout.tsx does NOT duplicate nested PosProvider', () => {
      const element = PosShellLayout();
      expect(element).toBeDefined();
      expect(element.type?.name).not.toBe('PosProvider');
    });
  });

  describe('State Reducer Integration for Opening Balances', () => {
    test('SET_OPENING_BALANCES action updates state appropriately', () => {
      const next = posReducer(initialPosState, {
        type: 'SET_OPENING_BALANCES',
        payload: { cash: 250000, qris: 0 },
      });
      expect(next.openingCash).toBe(250000);
      expect(next.openingQris).toBe(0);
    });
  });
});
