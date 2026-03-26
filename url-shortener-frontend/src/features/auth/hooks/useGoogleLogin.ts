"use client";

import { useCallback } from "react";

export const useGoogleLogin = () => {
    return useCallback(() => {
        window.location.assign("/backend/oauth2/authorization/google");
    }, []);
};