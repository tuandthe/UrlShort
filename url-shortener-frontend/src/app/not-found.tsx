import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-linear-to-br from-background via-muted/40 to-background px-4">
      <div className="max-w-lg space-y-5 text-center">
        <p className="bg-linear-to-r from-primary to-muted-foreground bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
          404
        </p>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Không tìm thấy trang</h2>
        <p className="text-sm text-muted-foreground">
          Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển. Hãy quay về trang chủ hoặc bảng điều khiển.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="transition-all duration-200">
            <Link href={ROUTES.HOME}>Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline" className="transition-all duration-200">
            <Link href={ROUTES.DASHBOARD}>Về bảng điều khiển</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
