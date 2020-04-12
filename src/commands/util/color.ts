import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Move } from "../../models/move";
import { CustomColor } from "../../models/customColors";

interface CommandArgs {
    query: string;
}

export default class MoveCommand extends KauriCommand {
    constructor() {
        super("BBColor Formatting", {
            aliases: ["color"],
            category: "Util",
            clientPermissions: ["SEND_MESSAGES"],
            description: "Provides BBCode color formatting for moves",
            requiresDatabase: true,
            usage: "color <move>"
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of a move to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        try {
            const move = await Move.findClosest("moveName", query);
            if (move) {
                const color = await CustomColor.getColorForType(message.author.id, move.moveType.toLowerCase());
                if(color) return message.util!.send(`[color=${color}]${move.moveName}[/color]`);
                else return message.util!.send("No color mapping found - use !color set <type> #<hex> to add one. (coming soon)");
            } else {
                this.client.logger.move(message, query, "none");
                return message.channel.embed("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
