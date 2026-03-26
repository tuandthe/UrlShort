import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { ROUTES } from "@/shared/constants/routes";
import { REGISTER_PAGE_TEXT } from "@/features/auth/constants/authUi.constants";

export default function RegisterPage() {
  return (
    <Card className="stitch-card w-full rounded-2xl p-8 md:p-9">
      <CardHeader className="mb-2 space-y-1 px-0 pt-0">
        <CardTitle className="text-2xl font-black tracking-tight">{REGISTER_PAGE_TEXT.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{REGISTER_PAGE_TEXT.description}</CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <RegisterForm />
        <div className="mt-9 text-center text-sm">
          <span className="block text-muted-foreground">
            {REGISTER_PAGE_TEXT.hasAccount}
            <Link href={ROUTES.LOGIN} className="ml-1 font-bold text-primary hover:underline">
              {REGISTER_PAGE_TEXT.signIn}
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
