import { render, screen } from '@testing-library/react';
import Skeleton from '@/app/components/Skeleton';

describe('Skeleton component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a div skeleton element', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.tagName).toBe('DIV');
    expect(skeleton?.classList.contains('rounded-md')).toBe(true);
  });

  it('renders with sm size', () => {
    const { container } = render(<Skeleton size="sm" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('w-4')).toBe(true);
    expect(skeleton?.classList.contains('h-4')).toBe(true);
  });

  it('renders with md size', () => {
    const { container } = render(<Skeleton size="md" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('w-8')).toBe(true);
    expect(skeleton?.classList.contains('h-8')).toBe(true);
  });

  it('renders with lg size', () => {
    const { container } = render(<Skeleton size="lg" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('w-12')).toBe(true);
    expect(skeleton?.classList.contains('h-12')).toBe(true);
  });

  it('renders with xl size', () => {
    const { container } = render(<Skeleton size="xl" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('w-16')).toBe(true);
    expect(skeleton?.classList.contains('h-16')).toBe(true);
  });

  it('renders with slate color', () => {
    const { container } = render(<Skeleton color="slate" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('bg-slate-900/30')).toBe(true);
  });

  it('renders with indigo color', () => {
    const { container } = render(<Skeleton color="indigo" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('bg-indigo-900/20')).toBe(true);
  });

  it('renders with emerald color', () => {
    const { container } = render(<Skeleton color="emerald" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('bg-emerald-900/20')).toBe(true);
  });

  it('renders with amber color', () => {
    const { container } = render(<Skeleton color="amber" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('bg-amber-900/20')).toBe(true);
  });

  it('renders with rose color', () => {
    const { container } = render(<Skeleton color="rose" />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('bg-rose-900/20')).toBe(true);
  });

  it('renders with label text', () => {
    render(<Skeleton label="Loading..." />);
    const label = screen.getByText('Loading...');
    expect(label).toBeDefined()
  });

  it('renders with bar variant', () => {
    const { container } = render(<Skeleton bar />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('animate-shimmer-bar')).toBe(true);
  });

  it('renders with circle variant', () => {
    const { container } = render(<Skeleton circle />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.classList.contains('animate-shimmer-circle')).toBe(true);
  });

  it('applies custom width fraction', () => {
    const { container } = render(<Skeleton widthFraction={0.5} />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.style.width).toBe('50%');
  });

  it('applies custom width fraction of 1', () => {
    const { container } = render(<Skeleton widthFraction={1} />);
    const skeleton = container.firstChild as HTMLElement | null;
    expect(skeleton?.style.width).toBe('100%');
  });
});