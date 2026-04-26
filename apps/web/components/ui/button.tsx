import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-display tracking-widest uppercase transition-opacity active:opacity-80 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60',
  {
    variants: {
      variant: {
        primary: 'bg-ember text-obsidian hover:bg-ember-glow',
        secondary: 'bg-cave text-bone border border-smoke hover:bg-elevated',
        ghost: 'text-ash hover:text-bone',
        danger: 'bg-blood text-bone',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-14 px-6 text-base',
        lg: 'h-16 px-8 text-lg',
        xl: 'h-20 px-10 text-xl',
        icon: 'h-14 w-14',
        iconLg: 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
