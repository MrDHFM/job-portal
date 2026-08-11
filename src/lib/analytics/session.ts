"use client";

const SESSION_KEY =
  "careersdiscover_analytics_session";

export function getAnalyticsSessionId() {
  try {
    let sessionId =
      localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId =
        crypto.randomUUID();

      localStorage.setItem(
        SESSION_KEY,
        sessionId,
      );
    }

    return sessionId;
  } catch {
    return null;
  }
}