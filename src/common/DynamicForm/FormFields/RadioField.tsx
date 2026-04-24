import { cn } from "@/lib/utils";
import type { Option } from "./FieldTypes";

interface RadioFieldProps {
  options: (string | Option)[];
  value: string | number;
  onChange: (val: string | number) => void;
  inline?: boolean;
  error?: boolean;
  className?: string;
}

export const RadioField = ({
  options = [],
  value,
  onChange,
  inline = false,
  error,
  className,
}: RadioFieldProps) => {
  return (
    <div className={cn(
      "flex gap-4",
      inline ? "flex-row flex-wrap" : "flex-col",
      className
    )}>
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const isChecked = value === val;

        return (
          <label key={val.toString()} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              checked={isChecked}
              onChange={() => onChange(val)}
              className={cn(
                "h-5 w-5 border-gray-300 text-primary-background focus:ring-primary-background/20 transition-all cursor-pointer",
                error && "border-red-500"
              )}
            />
            <span className="text-sm font-medium text-foreground/80 group-hover:text-primary-background transition-colors">
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
};
