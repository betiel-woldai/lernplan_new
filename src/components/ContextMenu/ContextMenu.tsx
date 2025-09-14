import React, { useEffect, useRef, ReactNode } from 'react';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function ContextMenu({
  isOpen,
  position,
  onClose,
  children,
  className = ''
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && position && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8;
      }

      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8;
      }

      if (x < 8) x = 8;
      if (y < 8) y = 8;

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [isOpen, position]);

  if (!isOpen || !position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-[9999] min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg
        py-1 animate-in fade-in-0 zoom-in-95 duration-100
        ${className}
      `}
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
}

export interface ContextMenuItemProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export function ContextMenuItem({
  children,
  onClick,
  icon,
  disabled = false,
  destructive = false,
  className = ''
}: ContextMenuItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      className={`
        w-full flex items-center px-3 py-2 text-sm text-left
        hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
        transition-colors duration-150
        ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}
        ${destructive && !disabled ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
    >
      {icon && (
        <span className={`mr-2 flex-shrink-0 ${disabled ? 'text-gray-300' : ''}`}>
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function ContextMenuSeparator({ className = '' }: { className?: string }) {
  return <div className={`my-1 border-t border-gray-200 ${className}`} role="separator" />;
}