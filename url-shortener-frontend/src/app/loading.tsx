import { Link2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-background via-muted/40 to-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />
          <div className="absolute inset-3 rounded-full bg-background" />
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Link2 className="h-4 w-4" />
          </div>
          <p className="text-base font-semibold tracking-tight">UrlShort</p>
        </div>

        <p className="text-sm text-muted-foreground">Đang chuẩn bị không gian làm việc...</p>
      </div>
    </div>
  );
}
