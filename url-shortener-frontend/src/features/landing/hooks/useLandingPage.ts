import {
    LANDING_FEATURES,
    LANDING_MOBILE_NAV,
    LANDING_PAGE_TEXT,
    LANDING_PLATFORM_STATS,
    LANDING_SOCIAL_LINKS,
} from "../constants/landingPage.constants";

export function useLandingPage() {
    return {
        currentYear: new Date().getFullYear(),
        text: LANDING_PAGE_TEXT,
        features: LANDING_FEATURES,
        platformStats: LANDING_PLATFORM_STATS,
        socialLinks: LANDING_SOCIAL_LINKS,
        mobileNav: LANDING_MOBILE_NAV,
    };
}
