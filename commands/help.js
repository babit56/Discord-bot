const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { capitalizeFirstLetter } = require("../util.js");

const commands = [];
const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .map(file => file.slice(0, -3));

for (const command of commandFiles) {
    const name = capitalizeFirstLetter(command.replace('-', ' '));
    commands.push([name, command]);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get help about a command")
        .addStringOption(option => option.setName("command")
            .setDescription("The command to learn about")
            .setRequired(true)
            .addChoices(commands)),
    async execute(interaction) {
        interaction.reply({content: "Yooooo", ephermal: true})
        // TODO: Add help/docs/wiki to grab info from
    }
}
