const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Character related commands'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};