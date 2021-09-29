const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("disconnect")
        .setDescription("Disconnects bot from call"),
    async execute(interaction) {
        if (!interaction.guild.me.voice.channel) {
            await interaction.reply({content: "Already disconnected!"})
        }
        await interaction.reply({content: "Disconnecting!"});
        getVoiceConnection(interaction.guildId)?.destroy();
    }
}
