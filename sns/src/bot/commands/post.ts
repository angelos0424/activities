import { SlashCommandBuilder } from "discord.js";

export const postCommandDefinition = new SlashCommandBuilder()
  .setName("post")
  .setDescription("sns-manager 게시물 작성 flow를 시작합니다.");
