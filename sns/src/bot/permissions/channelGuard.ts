export interface ChannelGuardConfig {
  snsChannelIds: string[];
}

export interface ChannelGuardResult {
  allowed: boolean;
  reason?: string;
}

export function canUseSnsCommand(
  channelId: string | null,
  config: ChannelGuardConfig,
): ChannelGuardResult {
  if (!channelId) {
    return {
      allowed: false,
      reason: "Discord channel 정보를 확인할 수 없습니다.",
    };
  }

  if (!config.snsChannelIds.includes(channelId)) {
    return {
      allowed: false,
      reason: "#sns로 설정된 Discord 채널에서만 `/post`를 실행할 수 있습니다.",
    };
  }

  return { allowed: true };
}
