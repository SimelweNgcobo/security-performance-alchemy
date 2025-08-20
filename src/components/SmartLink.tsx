import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useSmartNavigation } from '@/hooks/use-smart-navigation';

interface SmartLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
  className?: string;
  preloadOnHover?: boolean; // Whether to preload route on hover
}

/**
 * Smart Link component that preloads routes on hover for faster navigation
 */
const SmartLink: React.FC<SmartLinkProps> = ({
  to,
  children,
  className,
  preloadOnHover = true,
  ...props
}) => {
  const { navigate, preloadOnHover: preload } = useSmartNavigation();

  const handleMouseEnter = () => {
    if (preloadOnHover) {
      preload(to);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle middle-click, ctrl+click, etc.
    if (
      event.button !== 0 || // Not left click
      event.metaKey ||      // Cmd/Ctrl key
      event.ctrlKey ||      // Ctrl key
      event.shiftKey ||     // Shift key
      event.altKey          // Alt key
    ) {
      return;
    }

    // Use smart navigation for regular clicks
    event.preventDefault();
    navigate(to);
  };

  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default SmartLink;
