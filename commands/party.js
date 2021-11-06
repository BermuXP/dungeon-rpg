const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('party')
        .setDescription('Party commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a party'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('disband')
                .setDescription('Disband party'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leave the party'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('invite')
                .setDescription('Invite a player to join your party')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() == 'create') {
            await interaction.reply({ content: "You've created a party.", ephemeral: true });
        } else if (interaction.options.getSubcommand() == 'leave') {
            await interaction.reply({ content: "You've left the party.", ephemeral: true });
        } else if (interaction.options.getSubcommand() == 'disband') {
            await interaction.reply({ content: "You've disaband the party.", ephemeral: true });
        } else if (interaction.options.getSubcommand() == 'invite') {
            console.log(interaction); 
            await interaction.reply({ content: "You've invited .", ephemeral: true });
        }
        console.log(interaction);
    },
};