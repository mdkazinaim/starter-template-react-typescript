import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  className?: string;
}

export const ColorPicker = ({
  value = "#3b82f6",
  onChange,
  error,
  className,
}: ColorPickerProps) => {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-gray-50/50 border border-gray-200 rounded-lg p-0.5 h-11 transition-all duration-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-brand/10",
      error && "border-red-500",
      className
    )}>
      <div className="relative w-10 h-full rounded-l-[7px] overflow-hidden border-r border-gray-200 shadow-sm">
        <input
          type="color"
          value={value || "#3b82f6"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
        />
      </div>
      <div className="flex-1 flex items-center gap-2 px-2">
        <span className="text-xs font-bold text-gray-400 font-mono">HEX</span>
        <input
          type="text"
          value={value || "#3b82f6"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="bg-transparent border-0 outline-none text-sm font-bold uppercase font-mono w-full"
        />
      </div>
    </div>
  );
};
