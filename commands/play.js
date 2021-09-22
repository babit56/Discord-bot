const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play inputted song or resume playing')
        .addStringOption(option => option.setName('input').setDescription('url or song name')),
    async execute(interaction) {
        // wæ find song and connect and play weee
    }
};
