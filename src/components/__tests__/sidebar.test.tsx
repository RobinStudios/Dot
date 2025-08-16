import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';

describe('Sidebar', () => {
  it('renders the panel tabs', () => {
    render(<Sidebar />);

    const layersTab = screen.getByRole('button', {
      name: /layers/i,
    });

    expect(layersTab).toBeInTheDocument();
  });
});
