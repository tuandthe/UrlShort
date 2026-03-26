import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import LoginForm from "@/features/auth/components/LoginForm";
import { ROUTES } from "@/shared/constants/routes";
import { LOGIN_PAGE_TEXT } from "@/features/auth/constants/authUi.constants";

export default function LoginPage() {
  return (
    <Card className="stitch-card w-full rounded-2xl border-border/40 p-8 shadow-2xl md:p-9">
      <CardHeader className="mb-2 space-y-1 px-0 pt-0">
        <CardTitle className="text-4xl font-black tracking-tight">{LOGIN_PAGE_TEXT.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{LOGIN_PAGE_TEXT.description}</CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <LoginForm />
        <div className="mt-9 text-center text-sm">
          <span className="block text-muted-foreground">
            {LOGIN_PAGE_TEXT.noAccount}
            <Link href={ROUTES.REGISTER} className="ml-1 font-bold text-primary hover:underline">
              {LOGIN_PAGE_TEXT.signUp}
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
