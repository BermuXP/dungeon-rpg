const { MessageEmbed } = require('discord.js'); //import discord.js
var dbHandler = require('../dbhandler.js');
var { prefix, rarityTypes } = require('../bot.js');



module.exports = {
    data: {
        name: 'item',
        command: function (interaction, user) {
            var message = interaction.content;
            var itemName = message.replace(prefix + 'item ', '');
            if (itemName == '') {
                interaction.channel.send( { content: 'Please add an item name behind this command.' }); 
                return;
            }

            dbHandler.getItem(itemName, function (returnItem) {
                if (typeof returnItem != 'undefined') {
                    console.log(returnItem.rarity); 
                    console.log(rarityTypes[returnItem.rarity][1]);
                    var discEmbed = new MessageEmbed()
                        .setColor(rarityTypes[returnItem.rarity][1])
                        .setTitle(returnItem.name)
                        .setDescription(returnItem.description)
                        .setThumbnail("https://bermu.tv/public/img/" + returnItem.image_url)
                    interaction.channel.send({ embeds: [discEmbed] }); 
                    return;
                }
                interaction.channel.send({ content: 'No item found.' }); 
            });
        }
    }
};
