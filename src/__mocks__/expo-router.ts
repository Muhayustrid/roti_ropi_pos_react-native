import React from 'react';

const mockComponent = (name: string) => {
  const Component = (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

export const Stack = mockComponent('Stack');
export const Tabs = mockComponent('Tabs');
export const Slot = mockComponent('Slot');

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
});

export const usePathname = () => '/';
