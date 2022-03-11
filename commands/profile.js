const {MessageEmbed} = require('discord.js'); //import discord.js

module.exports = {
    data: {
        name: 'profile',
        command: function (interaction, user) {
            var discEmbed = new MessageEmbed()
                .setTitle(interaction.author.username)
                .setThumbnail(interaction.author.avatarURL())
                .setColor('#0x1254d9');
            interaction.channel.send({ embeds: [discEmbed] });
        }
    }
};
