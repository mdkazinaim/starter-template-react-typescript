import { cn } from "@/lib/utils";

interface StatusPillProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export const StatusPill = ({ label, variant = "neutral", className }: StatusPillProps) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-rose-50 text-rose-600 border-rose-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    neutral: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
};
