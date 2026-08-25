import React from 'react';

const mockIcon = (name: string) => {
  const Component = (props: Record<string, unknown>) => {
    return React.createElement(name, props);
  };
  Component.displayName = name;
  return Component;
};

export const MaterialIcons = mockIcon('MaterialIcons');
export default MaterialIcons;
