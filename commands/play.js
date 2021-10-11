const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play inputted song or resume playing')
        .addStringOption(option => option.setName('input').setDescription('URL or song name').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            return void interaction.reply({
                content: 'You are not in a voice channel!',
                ephermal: true
            });
        }
        if (interaction.guild.me.voice.channelId &&
            (interaction.guild.me.voice.channelId !== interaction.member.voice.channelId)) {
            return void interaction.reply({
                content: `I'm already in ${interaction.guild.me.voice.channel}!`,
                ephermal: true});
        }
        if (!interaction.guild.me.voice.channel) {
            joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
        }
        await interaction.deferReply();
        // TODO: Add song to queue and play (finish VoiceManager first)

        // if (!interaction.options.getString('input').trim()) {
        //     // play from queue
        // }
        // if (ytdl.validateURL(interaction.options.getString('input'))) {
        //     const stream = ytdl(interaction.options.getString('input'), {filter: 'audioonly'});
        //     const resource = createAudioResource(stream, {inputType: StreamType.Arbitrary})

        // }
        await interaction.editReply(`Joined ${interaction.guild.me.voice.channel}`);
        // const input = interaction.options.getString('input');
        // if (!input && 'queue not empty') 'play'
        // let videoURL = input;
        // if (!ytdl.validateURL(input)) {
        //     videoURL = ytsr(input)
        // }
        
    }
};
