export type DiscordWebhookResult =
  | {
      ok: true;
      status: "sent";
    }
  | {
      ok: true;
      status: "skipped";
      reason: "missing_webhook_url";
    }
  | {
      ok: false;
      status: "failed";
      error: string;
    };

type SendDiscordWebhookOptions = {
  username?: string;
};

export function isDiscordWebhookConfigured() {
  return Boolean(process.env.DISCORD_WEBHOOK_URL);
}

export async function sendDiscordWebhook(
  content: string,
  options: SendDiscordWebhookOptions = {},
): Promise<DiscordWebhookResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: true,
      status: "skipped",
      reason: "missing_webhook_url",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      body: JSON.stringify({
        content,
        username: options.username ?? "Loan Tracker",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const responseText = await response.text();
      return {
        ok: false,
        status: "failed",
        error: `Discord webhook failed with ${response.status}: ${responseText}`,
      };
    }

    return {
      ok: true,
      status: "sent",
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown webhook error",
    };
  }
}
