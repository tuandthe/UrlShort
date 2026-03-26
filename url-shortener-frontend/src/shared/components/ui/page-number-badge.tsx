import { cn } from "@/shared/lib/utils";

interface PageNumberBadgeProps {
    value: number;
    active?: boolean;
    className?: string;
}

export function PageNumberBadge({ value, active = false, className }: PageNumberBadgeProps) {
    return (
        <span
            className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border bg-secondary/80 text-sm",
                active
                    ? "border-primary/40 font-bold text-primary"
                    : "border-border bg-secondary/70 font-medium text-foreground",
                className
            )}
        >
            {value}
        </span>
    );
}
