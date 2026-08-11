type MetaTokenDebugResponse = {
  data?: {
    app_id?: string;
    type?: string;
    application?: string;
    data_access_expires_at?: number;
    expires_at?: number;
    is_valid?: boolean;
    scopes?: string[];
    user_id?: string;
  };

  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    is_transient?: boolean;
    fbtrace_id?: string;
  };
};

export type InstagramTokenHealth = {
  configured: boolean;

  /**
   * true  = Meta successfully confirmed token is valid
   * false = token is invalid/expired
   *
   * For temporary_unavailable/error this remains false,
   * but the UI should NOT use this alone to determine status.
   */
  valid: boolean;

  expiresAt: number | null;
  dataAccessExpiresAt: number | null;

  expiresInDays: number | null;
  dataAccessExpiresInDays: number | null;

  status:
    | "healthy"
    | "warning"
    | "critical"
    | "expired"
    | "temporary_unavailable"
    | "error"
    | "not_configured";

  message: string;
};

function emptyHealth(
  status: InstagramTokenHealth["status"],
  message: string,
  configured = true
): InstagramTokenHealth {
  return {
    configured,
    valid: false,

    expiresAt: null,
    dataAccessExpiresAt: null,

    expiresInDays: null,
    dataAccessExpiresInDays: null,

    status,
    message,
  };
}

export async function getInstagramTokenHealth(): Promise<InstagramTokenHealth> {
  const accessToken =
    process.env.INSTAGRAM_ACCESS_TOKEN;

  const appId =
    process.env.META_APP_ID;

  const appSecret =
    process.env.META_APP_SECRET;

  // --------------------------------------------------
  // Configuration check
  // --------------------------------------------------

  if (!accessToken || !appId || !appSecret) {
    return {
      configured: false,
      valid: false,

      expiresAt: null,
      dataAccessExpiresAt: null,

      expiresInDays: null,
      dataAccessExpiresInDays: null,

      status: "not_configured",

      message:
        "Instagram token monitoring is not configured.",
    };
  }

  try {
    const appAccessToken =
      `${appId}|${appSecret}`;

    const url =
      "https://graph.facebook.com/debug_token" +
      `?input_token=${encodeURIComponent(accessToken)}` +
      `&access_token=${encodeURIComponent(appAccessToken)}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data =
      (await response.json()) as MetaTokenDebugResponse;

    // --------------------------------------------------
    // IMPORTANT:
    // Meta code 2 + is_transient means temporary issue.
    // It does NOT mean token expired.
    // --------------------------------------------------

    if (
      data.error?.code === 2 &&
      data.error?.is_transient === true
    ) {
      console.warn(
        "Instagram token debug temporarily unavailable:",
        data.error
      );

      return emptyHealth(
        "temporary_unavailable",
        "Meta's Instagram service is temporarily unavailable. Token expiration could not be checked. We'll retry automatically."
      );
    }

    // --------------------------------------------------
    // Other API errors
    // --------------------------------------------------

    if (!response.ok || data.error) {
      console.error(
        "Instagram token debug failed:",
        data
      );

      return emptyHealth(
        "error",
        data.error?.message ||
          "Unable to verify Instagram token."
      );
    }

    const token = data.data;

    if (!token) {
      return emptyHealth(
        "error",
        "Meta returned no token information."
      );
    }

    const now =
      Math.floor(Date.now() / 1000);

    // --------------------------------------------------
    // Token expiration
    // --------------------------------------------------

    const expiresAt =
      token.expires_at &&
      token.expires_at > 0
        ? token.expires_at
        : null;

    // --------------------------------------------------
    // Data access expiration
    // --------------------------------------------------

    const dataAccessExpiresAt =
      token.data_access_expires_at &&
      token.data_access_expires_at > 0
        ? token.data_access_expires_at
        : null;

    const expiresInDays =
      expiresAt !== null
        ? Math.ceil(
            (expiresAt - now) /
              (60 * 60 * 24)
          )
        : null;

    const dataAccessExpiresInDays =
      dataAccessExpiresAt !== null
        ? Math.ceil(
            (dataAccessExpiresAt - now) /
              (60 * 60 * 24)
          )
        : null;

    // --------------------------------------------------
    // Determine token status
    // --------------------------------------------------

    let status: InstagramTokenHealth["status"];
    let message: string;

    if (token.is_valid === false) {
      status = "expired";

      message =
        "Instagram access token is invalid or expired.";
    } else if (
      expiresInDays !== null &&
      expiresInDays <= 0
    ) {
      status = "expired";

      message =
        "Instagram access token has expired.";
    } else if (
      expiresInDays !== null &&
      expiresInDays <= 7
    ) {
      status = "critical";

      message =
        `Instagram token expires in ${expiresInDays} day${
          expiresInDays === 1 ? "" : "s"
        }. Renew it immediately.`;
    } else if (
      expiresInDays !== null &&
      expiresInDays <= 30
    ) {
      status = "warning";

      message =
        `Instagram token expires in ${expiresInDays} days. Renew it soon.`;
    } else {
      status = "healthy";

      message =
        "Instagram access token is healthy.";
    }

    return {
      configured: true,

      valid:
        token.is_valid !== false,

      expiresAt,
      dataAccessExpiresAt,

      expiresInDays,
      dataAccessExpiresInDays,

      status,
      message,
    };
  } catch (error) {
    console.error(
      "Instagram token health check failed:",
      error
    );

    // Network errors can also be temporary.
    return emptyHealth(
      "temporary_unavailable",
      "Unable to reach Meta right now. Token status could not be checked. We'll retry automatically."
    );
  }
}