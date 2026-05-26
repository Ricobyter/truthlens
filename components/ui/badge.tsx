import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-500/20 text-violet-300",
        secondary: "border-transparent bg-white/10 text-white/70",
        outline: "border-white/20 text-white/70",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        danger: "border-red-500/30 bg-red-500/10 text-red-400",
        warning: "border-orange-500/30 bg-orange-500/10 text-orange-400",
        info: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
        muted: "border-slate-500/30 bg-slate-500/10 text-slate-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
