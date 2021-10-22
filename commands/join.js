const { SlashCommandBuilder } = require("@discordjs/builders");
// const ytdl = require("ytdl-core");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription(`Joins your voice channel.`),
    execute(voiceManager, interaction) {
        // TODO: Join vc
        console.log("Join vc plz");
        console.log(interaction);
    }
}
