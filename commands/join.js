const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins your voice channel. Won\'t work f I\'m already in a vc. Administrator permissions overrides this'),
    execute(interaction) {
        console.log('joining lmao');
    }
}
