const { Client, IntentsBitField, Partials, Events, REST, Routes } = require('discord.js'); //
const keepAlive = require("./server.js");
const fs = require('node:fs'); //
const path = require('node:path'); //
const space = require("./space.js");
const suggestions = require("./modules/suggestions.js");

const rest = new REST(({ version: '10' }).setToken(token)) //
client.commands = new Collection(); //
const commands = []; //

const commandsPath = path.join(__dirname, 'commands'); //
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); //

for (const file of commandFiles) { //
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
}

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

client.on(Events.InteractionCreate, async interaction =>{ //
	console.log("New interaction!");
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	await command.execute(interaction);
})

// Important bot stuff
keepAlive();
client.login(process.env['TOKEN']);