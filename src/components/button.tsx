import type { AppCommand } from '@/app-command';
import { type ShortcutModifiers, buildNormalizedKey, useKeyEvent } from '@/components/key-emitter';
import { useChromeAction, useChromeActionInfoQuery } from '@/lib/use-chrome-action';
import { useQuery } from '@tanstack/react-query';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { useSpinDelay } from 'spin-delay';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  delayedDisabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, delayedDisabled, disabled, ...props }, ref) => {
    const isDisabled =
      (useSpinDelay(delayedDisabled ?? false, { delay: 0 }) && delayedDisabled !== undefined) ||
      disabled;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

const ShortcutButton = ({
  shortcut,
  modifiers,
  children,
  className,
  disabled,
  ...props
}: ButtonProps & {
  shortcut: string;
  modifiers?: ShortcutModifiers[];
  onClick: () => void;
}) => {
  useKeyEvent({ key: shortcut, modifiers }, () => {
    props.onClick?.();
  });

  return (
    <Button className={cn('flex items-center justify-center gap-2', className)} {...props}>
      {children}
      <span className="text-xs font-mono bg-gray-700 text-gray-300 px-1 py-0.5 rounded-sm">
        {buildNormalizedKey({ key: shortcut, modifiers })}
      </span>
    </Button>
  );
};

const ChromeCommandButton = ({
  commandName,
  children,
  className,
  delayedDisabled,
  disabled,
  subscribeToCommand,
  ...props
}: ButtonProps & {
  commandName: AppCommand;
  onClick: () => void;
  delayedDisabled?: boolean;
  subscribeToCommand?: boolean;
}) => {
  useChromeAction(
    commandName,
    () => {
      props.onClick?.();
    },
    subscribeToCommand ?? false,
  );
  const { data } = useChromeActionInfoQuery(commandName);

  const isDisabled =
    (useSpinDelay(delayedDisabled ?? false, { delay: 0 }) && delayedDisabled !== undefined) ||
    disabled;
  return (
    <Button
      className={cn('flex items-center justify-center gap-2', className)}
      disabled={isDisabled}
      {...props}
    >
      {children}
      {!!data?.shortcut && (
        <span className="text-xs font-mono bg-gray-700 text-gray-300 px-1 py-0.5 rounded-sm">
          {data?.shortcut}
        </span>
      )}
    </Button>
  );
};

export { Button, buttonVariants, ShortcutButton, ChromeCommandButton };
