import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

it('renders Vite and React logos', () => {
  render(<App />);
  const viteLogo = screen.getByAltText('Vite logo');
  const reactLogo = screen.getByAltText('React logo');
  expect(viteLogo).toBeInTheDocument();
  expect(reactLogo).toBeInTheDocument();
});

it('renders initial count', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /count is 0/i });
  expect(button).toBeInTheDocument();
});

it('increments count on button click', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /count is 0/i });
  fireEvent.click(button);
  expect(button).toHaveTextContent('count is 1');
});

it('renders Vite and React links', () => {
  render(<App />);
  const viteLink = screen.getByRole('link', { name: /vite/i });
  const reactLink = screen.getByRole('link', { name: /react/i });
  expect(viteLink).toHaveAttribute('href', 'https://vite.dev');
  expect(reactLink).toHaveAttribute('href', 'https://react.dev');
});