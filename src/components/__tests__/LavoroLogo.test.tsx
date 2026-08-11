import React from 'react';
import { render, screen } from '@testing-library/react';
import { LavoroLogo, LavoroBrand } from '../LavoroLogo';

describe('LavoroLogo', () => {
    it('should render SVG element', () => {
        const { container } = render(<LavoroLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('should render with default size', () => {
        const { container } = render(<LavoroLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '40');
        expect(svg).toHaveAttribute('height', '24'); // 40 * 0.6
    });

    it('should render with custom size', () => {
        const { container } = render(<LavoroLogo size={80} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '80');
        expect(svg).toHaveAttribute('height', '48'); // 80 * 0.6
    });

    it('should render blue variant by default', () => {
        const { container } = render(<LavoroLogo />);
        const path = container.querySelector('path');
        expect(path).toHaveAttribute('fill', '#2563eb');
    });

    it('should render white variant when specified', () => {
        const { container } = render(<LavoroLogo variant="white" />);
        const path = container.querySelector('path');
        expect(path).toHaveAttribute('fill', '#ffffff');
    });

    it('should apply custom className', () => {
        const { container } = render(<LavoroLogo className="custom-class" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('custom-class');
    });

    it('should have correct viewBox', () => {
        const { container } = render(<LavoroLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 100 60');
    });
});

describe('LavoroBrand', () => {
    it('should render logo and text by default', () => {
        render(<LavoroBrand />);
        expect(screen.getByText('LAVORO')).toBeInTheDocument();
    });

    it('should hide text when showText is false', () => {
        render(<LavoroBrand showText={false} />);
        expect(screen.queryByText('LAVORO')).not.toBeInTheDocument();
    });

    it('should render with blue variant styling', () => {
        render(<LavoroBrand variant="blue" />);
        const text = screen.getByText('LAVORO');
        expect(text).toHaveClass('text-gray-900');
    });

    it('should render with white variant styling', () => {
        render(<LavoroBrand variant="white" />);
        const text = screen.getByText('LAVORO');
        expect(text).toHaveClass('text-white');
    });

    it('should apply custom className to container', () => {
        const { container } = render(<LavoroBrand className="my-custom-class" />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('my-custom-class');
    });

    it('should pass size prop to logo', () => {
        const { container } = render(<LavoroBrand size={60} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '60');
    });
});
