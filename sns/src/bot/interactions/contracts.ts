export interface SelectInteractionHandler<TInteraction = unknown> {
  customId: string;
  handle(interaction: TInteraction): Promise<void>;
}

export interface AttachmentFlowHandler<TInteraction = unknown> {
  customId: string;
  handle(interaction: TInteraction): Promise<void>;
}
