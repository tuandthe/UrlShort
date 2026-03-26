"use client";

import { format } from "date-fns";
import { Bell, Loader2, Search, TrendingUp, Trash2, UserCheck } from "lucide-react";
import Image from "next/image";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useAdminDashboardViewModel } from "@/features/admin/hooks/useAdminDashboardViewModel";
import { useCountUpValue } from "@/features/admin/hooks/useCountUpValue";
import { ADMIN_DASHBOARD_TEXT } from "@/features/admin/constants/adminDashboard.constants";
import { AdminUserStatusFilter } from "@/features/admin/types/admin.types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DATE_FORMATS } from "@/shared/constants/formats";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { PageNumberBadge } from "@/shared/components/ui/page-number-badge";
import { cn } from "@/shared/lib/utils";

function CountUpValue({ value }: { value: number }) {
    const displayValue = useCountUpValue(value);

    return <>{displayValue.toLocaleString()}</>;
}

export default function AdminDashboardPage() {
    const {
        dashboard,
        trendData,
        isLoading,
        isError,
        isTrendLoading,
        isTrendError,
        usersResponse,
        users,
        usersView,
        isUsersLoading,
        isUsersError,
        statCards,
        usersPage,
        userSearch,
        userStatus,
        trendGroupBy,
        canPrevUsersPage,
        canNextUsersPage,
        goToPrevUsersPage,
        goToNextUsersPage,
        setUserSearch,
        setUserStatus,
        setTrendGroupBy,
        softDeleteUser,
        activateUser,
        isSoftDeletingUser,
        isActivatingUser,
    } = useAdminDashboardViewModel();

    const statusTabs: Array<{ label: string; value: AdminUserStatusFilter }> = [
        { label: ADMIN_DASHBOARD_TEXT.userFilterAll, value: "ALL" },
        { label: ADMIN_DASHBOARD_TEXT.userFilterActive, value: "ACTIVE" },
        { label: ADMIN_DASHBOARD_TEXT.userFilterInactive, value: "INACTIVE" },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-75 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !dashboard) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-destructive">
                    {ADMIN_DASHBOARD_TEXT.statsError}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-10">
            <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-[2.1rem]">{ADMIN_DASHBOARD_TEXT.pageTitle}</h1>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{ADMIN_DASHBOARD_TEXT.pageSubtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="rounded-xl border border-border bg-secondary/70 p-2 text-primary" aria-label={ADMIN_DASHBOARD_TEXT.notificationsAriaLabel}>
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className="stitch-card rounded-2xl p-6">
                            <CardContent className="flex flex-col items-center justify-center p-0 text-center">
                                <div className="mb-4 rounded-full border border-border bg-secondary/70 p-4">
                                    <Icon className="h-7 w-7 text-primary" />
                                </div>
                                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                                <h2 className="text-4xl font-bold text-foreground">
                                    <CountUpValue value={card.value} />
                                </h2>
                                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {ADMIN_DASHBOARD_TEXT.growthLabel}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <Card className="stitch-card rounded-2xl p-6">
                <CardContent className="p-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">{ADMIN_DASHBOARD_TEXT.clickTrendSectionTitle}</h3>
                        <div className="flex items-center gap-1.5 rounded-xl bg-secondary/55 p-1.5">
                            <button
                                type="button"
                                onClick={() => setTrendGroupBy("week")}
                                className={cn(
                                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                                    trendGroupBy === "week"
                                        ? "bg-secondary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {ADMIN_DASHBOARD_TEXT.trendFilterWeek}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTrendGroupBy("month")}
                                className={cn(
                                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                                    trendGroupBy === "month"
                                        ? "bg-secondary text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {ADMIN_DASHBOARD_TEXT.trendFilterMonth}
                            </button>
                        </div>
                    </div>

                    {isTrendLoading ? (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            {ADMIN_DASHBOARD_TEXT.trendLoading}
                        </div>
                    ) : isTrendError ? (
                        <div className="flex h-64 items-center justify-center text-sm text-destructive">
                            {ADMIN_DASHBOARD_TEXT.trendError}
                        </div>
                    ) : trendData.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                            {ADMIN_DASHBOARD_TEXT.trendEmpty}
                        </div>
                    ) : (
                        <div className="h-72 w-full rounded-xl border border-border bg-secondary/45 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="period" axisLine={false} tickLine={false} tickMargin={10} />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--card)",
                                        }}
                                        labelStyle={{ color: "var(--muted-foreground)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <section className="mb-8 flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={ADMIN_DASHBOARD_TEXT.userSearchPlaceholder}
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        className="stitch-input w-full rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex items-center gap-1.5 rounded-xl bg-secondary/55 p-1.5">
                    {statusTabs.map((tab) => {
                        const isActive = userStatus === tab.value;

                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setUserStatus(tab.value)}
                                className={cn(
                                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                                    isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            <Card className="stitch-card overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {isUsersLoading ? (
                        <div className="p-6 text-sm text-muted-foreground">{ADMIN_DASHBOARD_TEXT.usersLoading}</div>
                    ) : isUsersError ? (
                        <div className="p-6 text-sm text-destructive">{ADMIN_DASHBOARD_TEXT.usersError}</div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">{ADMIN_DASHBOARD_TEXT.usersEmpty}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.avatar}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.user}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.email}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.provider}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.status}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.joinedAt}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.role}</TableHead>
                                        <TableHead>{ADMIN_DASHBOARD_TEXT.tableHeaders.actions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersView.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                {user.avatarUrlResolved ? (
                                                    <Image
                                                        src={user.avatarUrlResolved}
                                                        alt={user.fullName || user.email}
                                                        width={32}
                                                        height={32}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/70 text-xs font-semibold text-primary">
                                                        {(user.fullName || user.email).slice(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {user.displayName}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {user.provider || ADMIN_DASHBOARD_TEXT.fallbackValue}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${user.statusClassName}`}>
                                                    {user.statusLabel}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.createdAt ? format(new Date(user.createdAt), DATE_FORMATS.TABLE_DATE) : ADMIN_DASHBOARD_TEXT.fallbackValue}
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground">{user.role}</TableCell>
                                            <TableCell>
                                                {user.active ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => softDeleteUser(user.id)}
                                                        disabled={isSoftDeletingUser || isActivatingUser}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => activateUser(user.id)}
                                                        disabled={isSoftDeletingUser || isActivatingUser}
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        {ADMIN_DASHBOARD_TEXT.activateUserButton}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {ADMIN_DASHBOARD_TEXT.totalUsersLabel}: {usersResponse?.totalItems ?? users.length}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevUsersPage}
                        disabled={!canPrevUsersPage || isUsersLoading}
                    >
                        {ADMIN_DASHBOARD_TEXT.previousPage}
                    </Button>
                    <PageNumberBadge value={usersPage + 1} active className="min-w-20" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextUsersPage}
                        disabled={!canNextUsersPage || isUsersLoading}
                    >
                        {ADMIN_DASHBOARD_TEXT.nextPage}
                    </Button>
                </div>
            </div>
        </div>
    );
}