import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Define button variants using class-variance-authority
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transform cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#1C73E0] text-white border border-[#1C73E0] hover:bg-white hover:text-[#1C73E0] shadow-sm",
        outline:
          "border border-[#C8CFD9] bg-white text-gray-700 hover:border-[#1C73E0] hover:text-[#1C73E0] shadow-sm",
        ghost: "text-[#1C73E0] hover:bg-blue-50",
        danger: "bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600 shadow-sm",
        success: "bg-emerald-600 text-white border border-emerald-600 hover:bg-white hover:text-emerald-600 shadow-sm",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5 py-3 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  title?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      title,
      leftIcon,
      rightIcon,
      isLoading = false,
      variant,
      size,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine which icons to show
    const showLeftIcon = leftIcon && !isLoading;
    const showRightIcon = rightIcon && !isLoading;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        )}
        
        {showLeftIcon && (
          <span className="flex items-center shrink-0">{leftIcon}</span>
        )}
        
        {/* Support both children and title for maximum flexibility */}
        {children ? (
          children
        ) : (
          title && <span>{title}</span>
        )}

        {showRightIcon && (
          <span className="flex items-center shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
