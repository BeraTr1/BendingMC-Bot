const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Provides information about the ping.'),
	async execute(interaction) {
		await interaction.reply(`pong!`);
	},
};