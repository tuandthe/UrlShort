export const ANALYTICS_DETAIL_TEXT = {
    reportTitle: "Báo cáo hiệu suất",
    linkId: "Phân tích cho",
    last30Days: "30 ngày gần nhất",
    export: "Xuất dữ liệu",
} as const;

export const ANALYTICS_DASHBOARD_TEXT = {
    loadError: "Không thể tải dữ liệu phân tích cho ID",
    cards: {
        totalClicks: "Tổng lượt nhấp",
        avgClicksPerDay: "Lượt nhấp trung bình/ngày",
        topReferrer: "Nguồn truy cập chính",
        top: "Top",
    },
    growth: {
        up: "+12.4%",
        down: "-2.1%",
    },
    sections: {
        clicksOverTime: "Xung tương tác",
        trafficSources: "Nguồn truy cập",
        topCountries: "Phân bố địa lý",
        deviceBreakdown: "Thiết bị truy cập",
    },
    viewFullDetails: "Xem chi tiết đầy đủ",
    deviceLabels: {
        mobile: "Di động",
        desktop: "Máy tính",
        tablet: "Máy tính bảng",
    },
    deviceValues: {
        mobile: "68%",
        desktop: "28%",
        tablet: "4%",
    },
} as const;

export const ANALYTICS_REFERRER_BAR_CLASS = ["bg-primary", "bg-chart-1", "bg-muted-foreground"] as const;
export const ANALYTICS_REFERRER_DOT_CLASS = ["bg-primary", "bg-chart-1", "bg-muted-foreground"] as const;
