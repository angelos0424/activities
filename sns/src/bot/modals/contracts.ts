export interface ModalSubmitHandler<TInteraction = unknown> {
  customId: string;
  handle(interaction: TInteraction): Promise<void>;
}
