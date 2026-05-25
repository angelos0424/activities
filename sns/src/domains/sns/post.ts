export interface PostCommandInput {
  requesterId: string;
  interactionId: string;
  guildId: string | null;
  channelId: string | null;
}

export interface DomainCommandResponse {
  content: string;
  ephemeral: boolean;
}

export interface PostCommandHandler {
  startPost(input: PostCommandInput): Promise<DomainCommandResponse>;
}

export class SnsPostCommandHandler implements PostCommandHandler {
  async startPost(input: PostCommandInput): Promise<DomainCommandResponse> {
    return {
      ephemeral: true,
      content: [
        "게시물 작성 flow를 시작합니다.",
        "",
        "현재 runtime은 `/post` command boundary와 domain routing만 제공합니다.",
        "다음 단계에서 target 선택, modal, file upload flow가 이 handler 뒤에 연결됩니다.",
        "",
        `요청 ID: ${input.interactionId}`,
      ].join("\n"),
    };
  }
}
