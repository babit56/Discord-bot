const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Display info about yourself.'),
    async execute(interaction) {
        // eslint-disable-next-line max-len
        return interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
    }
};
