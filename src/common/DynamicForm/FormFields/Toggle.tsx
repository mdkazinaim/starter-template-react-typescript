import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ToggleProps {
  label?: string;
  value: boolean;
  onChange: (val: boolean) => void;
  required?: boolean;
  error?: boolean;
  className?: string;
}

export const Toggle = ({
  label,
  value,
  onChange,
  required,
  error,
  className,
}: ToggleProps) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 p-3.5 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer group",
        error && "border-red-500",
        className
      )} 
      onClick={() => onChange(!value)}
    >
      {label && (
        <Label className={cn("text-sm font-bold text-foreground/80 cursor-pointer group-hover:text-primary-text transition-colors", error && "text-red-600")}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}
      <button
        type="button"
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-brand focus:ring-offset-2",
          value ? "bg-primary-brand border-primary-brand" : "bg-gray-300 border-gray-300",
          error && "ring-2 ring-red-500 ring-offset-2"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            value ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};
