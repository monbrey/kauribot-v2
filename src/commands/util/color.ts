import { Collection, Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { CustomColor } from "../../models/customColors";
import { IMoveDocument } from "../../models/move";
import { stripIndents } from "common-tags";

interface CommandArgs {
    moves: IMoveDocument[];
}

export default class MoveCommand extends KauriCommand {
    private response?: Message;

    constructor() {
        super("BBColor Formatting", {
            aliases: ["color"],
            category: "Util",
            clientPermissions: ["SEND_MESSAGES"],
            description: "Provides BBCode color formatting for moves",
            requiresDatabase: true,
            separator: ",",
            usage: "color <move>"
        });
    }

    public *args() {
        const moves = yield {
            type: "move",
            match: "separate",
            prompt: {
                start: "> Please provide the names of moves to lookup"
            }
        };

        return { moves };
    }

    public async before(message: Message) {
        const embed = new MessageEmbed().setTitle("Parsing and looking up data...");
        this.response = await message.util!.send(embed)
    }

    public async exec(message: Message, { moves }: CommandArgs) {
        if (moves.length === 0) return this.response?.edit(new MessageEmbed().setTitle("No moves found").setColor(0xffc107));
        try {
            const colors = await CustomColor.find({});
            if (colors.length === 0) return this.response?.edit(new MessageEmbed().setTitle(`No colours found for ${message.author}`).setColor(0xffc107));

            const [found, missing] = new Collection(moves.map(m => ([m._id, m]))).partition(m => colors.some(c => c.key === m.moveType.toLowerCase()));
            const response = found.map(m => {
                const { color } = colors.find(c => c.key === m.moveType.toLowerCase())!;
                return `[color=${color}]${m.moveName}[/color]`;
            });

            const embed = new MessageEmbed().setTitle("Parsed results").setDescription(`\`\`\`${response.join("\n")}\`\`\``).setColor(0x267f00);
            if (missing.size) {
                const missingTypes = Array.from(new Set(missing.map(m => m.moveType))).join(", ")
                embed.setFooter(`No colours set for ${missingTypes} - these moves were excluded`);
            }
            return this.response?.edit(embed)
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
