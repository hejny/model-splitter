import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from './App';

test('renders name of the project', () => {
    render(<App />);
    const linkElement = screen.getByText(/Model splitter/i);
    expect(linkElement).toBeInTheDocument();
});