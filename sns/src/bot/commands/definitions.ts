import { postCommandDefinition } from "./post.js";

export const commandDefinitions = [postCommandDefinition];

export function commandDefinitionsJson(): unknown[] {
  return commandDefinitions.map((command) => command.toJSON());
}
