const { Client, IntentsBitField, Partials, Events } = require('discord.js'); //
const token = process.env['TOKEN'];
const keepAlive = require("./server.js");
const fs = require('node:fs'); //
const path = require('node:path'); //
const space = require("./space.js");
const suggestions = require("./modules/suggestions.js");

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessageReactions
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	]
});

client.commands = new Collection(); //
const commandsPath = path.join(__dirname, 'commands'); //
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); //

for (const file of commandFiles) { //
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
}

// Debug message event listener
client.on(Events.MessageCreate, msg =>{
	if (msg.author.id === client.user.id){
		return
	}
	
	if (msg.content === "ping"){
		msg.reply("pong!");
	}
})

// Execute modules here
suggestions.newSuggestion(client, Events);
suggestions.resolveSuggestion(client, Events);
space.ping(client, Events);

async () =>{ //
	const data = await rest.put(Routes.applicationCommands(client.id), {body: commands});
	console.log(data.length)
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Important bot stuff
keepAlive();
client.login(token);