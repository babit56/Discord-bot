const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, prefix } = require('./config.json');
const { getVoiceConnection } = require('@discordjs/voice');
const VoiceManager = require('./Manager');

const client = new Client({
    intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const voiceManager = new VoiceManager();

// Register commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Register events
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(voiceManager, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(voiceManager, ...args));
    }
}

// Main interaction event for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(voiceManager, interaction);
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Main interaction even for text commands
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const inputCommand = args.shift().toLowerCase();
    
    if (inputCommand === "disconnect") {
        getVoiceConnection(message.guildId)?.destroy()
    }
    if (inputCommand === "voice") {
        message.reply({content: 
            `I'm in voice channel ${message.guild.me.voice.channel}, id: ${message.guild.me.voice.channelId}`})
    }
    // const command = client.commands.get(inputCommand);

    // if (!command) return;

    // try {
    //     await command.execute(args);
    // } catch (error) {
    //     console.error(error);
    //     return message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    // }
})

// Bot is initalized and ready
client.once('ready', () => {
    console.log('Ready!');
});

client.on('error', () => {
    console.log('fuck');
})

client.login(token);
