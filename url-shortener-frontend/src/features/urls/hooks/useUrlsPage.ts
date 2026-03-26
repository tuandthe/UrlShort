import { useEffect, useState } from "react";

import { UrlSortBy, UrlSortDir, UrlStatusFilter } from "../types/url.types";
import { SortValue } from "../constants/urlsPage.constants";

export function useUrlsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState<UrlStatusFilter>("ALL");
    const [sortBy, setSortBy] = useState<UrlSortBy>("createdAt");
    const [sortDir, setSortDir] = useState<UrlSortDir>("desc");
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [sortDialogOpen, setSortDialogOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<UrlStatusFilter>("ALL");
    const [pendingSort, setPendingSort] = useState<SortValue>("createdAt:desc");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [search]);

    const handleSortChange = (value: SortValue) => {
        const [nextSortBy, nextSortDir] = value.split(":") as [UrlSortBy, UrlSortDir];
        setSortBy(nextSortBy);
        setSortDir(nextSortDir);
    };

    const handleFilterDialogChange = (open: boolean) => {
        setFilterDialogOpen(open);
        if (open) {
            setPendingStatus(status);
        }
    };

    const handleSortDialogChange = (open: boolean) => {
        setSortDialogOpen(open);
        if (open) {
            setPendingSort(`${sortBy}:${sortDir}`);
        }
    };

    const applyFilter = () => {
        setStatus(pendingStatus);
        setFilterDialogOpen(false);
    };

    const clearFilter = () => {
        setPendingStatus("ALL");
        setStatus("ALL");
        setFilterDialogOpen(false);
    };

    const applySort = () => {
        handleSortChange(pendingSort);
        setSortDialogOpen(false);
    };

    return {
        search,
        debouncedSearch,
        status,
        sortBy,
        sortDir,
        filterDialogOpen,
        sortDialogOpen,
        pendingStatus,
        pendingSort,
        setSearch,
        setStatus,
        setPendingStatus,
        setPendingSort,
        handleFilterDialogChange,
        handleSortDialogChange,
        applyFilter,
        clearFilter,
        applySort,
    };
}
