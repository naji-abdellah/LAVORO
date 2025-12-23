'use client';

interface LavoroLogoProps {
    size?: number;
    variant?: 'blue' | 'white';
    className?: string;
}

/**
 * LAVORO Logo Component
 * Geometric angular design inspired by antigravity and advanced technology.
 * The interlocking W/M shape suggests lift, balance, and precision engineering.
 */
export function LavoroLogo({ size = 40, variant = 'blue', className = '' }: LavoroLogoProps) {
    const fillColor = variant === 'blue' ? '#2563eb' : '#ffffff';
    const strokeColor = variant === 'blue' ? '#ffffff' : '#2563eb';

    return (
        <svg
            width={size}
            height={size * 0.6}
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Left angular section */}
            <path
                d="M0 0 L20 0 L35 30 L20 60 L0 60 L15 30 Z"
                fill={fillColor}
            />
            {/* Center-left angular section */}
            <path
                d="M22 0 L42 0 L50 15 L42 30 L22 30 L30 15 Z"
                fill={fillColor}
            />
            {/* Center-right angular section */}
            <path
                d="M58 30 L78 30 L70 45 L78 60 L58 60 L50 45 Z"
                fill={fillColor}
            />
            {/* Right angular section */}
            <path
                d="M80 0 L100 0 L85 30 L100 60 L80 60 L65 30 Z"
                fill={fillColor}
            />
            {/* Center diamond connecting piece */}
            <path
                d="M44 25 L56 25 L56 35 L44 35 Z"
                fill={fillColor}
                transform="rotate(45 50 30)"
            />
            {/* Subtle geometric lines for depth */}
            <line x1="25" y1="0" x2="50" y2="30" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
            <line x1="75" y1="0" x2="50" y2="30" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
            <line x1="25" y1="60" x2="50" y2="30" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
            <line x1="75" y1="60" x2="50" y2="30" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        </svg>
    );
}

/**
 * Full LAVORO brand mark with logo and text
 */
export function LavoroBrand({
    size = 40,
    variant = 'blue',
    showText = true,
    className = ''
}: LavoroLogoProps & { showText?: boolean }) {
    const textColor = variant === 'blue' ? 'text-gray-900' : 'text-white';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <LavoroLogo size={size} variant={variant} />
            {showText && (
                <span className={`font-bold text-xl tracking-wider ${textColor}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}>
                    LAVORO
                </span>
            )}
        </div>
    );
}

export default LavoroLogo;
