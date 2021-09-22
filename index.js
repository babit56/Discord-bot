const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
import { token } from './config.json';
import { parse } from "discord-command-parser";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commandPrefix = "-"
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events')
    .filter(file => file.endsWith('.js'));

// Register commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Register events
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Main interaction event for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Main interaction even for text commands
client.on('messageCreate', async message => {
    const parsed = parse(message.content, commandPrefix, {allowSpaceBeforeCommand: true});
    if (!parsed.success) return;

    const command = client.commands.get(parsed.command);

    if (!command) return;

    try {
        await command.execute(parsed);
    } catch (error) {
        console.error(error);
        return message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

// Bot is initalized and ready
client.once('ready', () => {
    console.log('Ready!');
});

client.login(token);
