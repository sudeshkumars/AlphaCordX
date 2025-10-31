const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const config = require('./config.json');
const db = require('./database');
const { startServer } = require('./server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

function generateTrackingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

global.notifyClick = async (data) => {
  try {
    const channel = await client.channels.fetch(config.logChannelId);
    if (!channel) return;

    const link = db.getLink(data.linkId);
    const userTag = data.user.discriminator && data.user.discriminator !== '0' 
      ? `${data.user.username}#${data.user.discriminator}`
      : data.user.username;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🔔 Link Clicked!')
      .setDescription(`<@${data.user.id}> accessed a tracked link`)
      .addFields(
        { name: '👤 User', value: `${userTag}\nID: ${data.user.id}`, inline: true },
        { name: '🔗 Link ID', value: data.linkId, inline: true },
        { name: '📁 Original URL', value: link.original_url.substring(0, 100) + (link.original_url.length > 100 ? '...' : ''), inline: false },
        { name: '🕐 Timestamp', value: `<t:${Math.floor(data.timestamp / 1000)}:F>`, inline: false }
      )
      .setThumbnail(`https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Servers: ${client.guilds.cache.size}`);
  
  // Set activity status
  client.user.setActivity('Total Entity', { type: ActivityType.Watching });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'cn') {
    if (args.length === 0) {
      return message.reply('❌ Usage: `!cn <url>`');
    }

    const url = args[0];

    if (!isValidUrl(url)) {
      return message.reply('❌ Invalid URL. Please provide a valid URL.');
    }

    try {
      const existingLink = db.getLinkByUrl(url);
      if (existingLink) {
        const trackingUrl = `${config.serverUrl}/files/${existingLink.id}`;
        return message.reply(`ℹ️ This URL is already tracked!\n🔗 Tracking link: ${trackingUrl}`);
      }

      let trackingId;
      do {
        trackingId = generateTrackingId();
      } while (db.getLink(trackingId));

      db.createLink(trackingId, url, message.author.id);

      const trackingUrl = `${config.serverUrl}/files/${trackingId}`;

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Tracking Link Created')
        .setDescription('Share this link to track who accesses your file.')
        .addFields(
        { name: '🔗 Tracking Link', value: `\`\`\`${trackingUrl}\`\`\``, inline: false },
          { name: '📁 Original URL', value: url.substring(0, 100) + (url.length > 100 ? '...' : ''), inline: false },
          { name: '🆔 Link ID', value: trackingId, inline: true },
          { name: '👤 Created By', value: `<@${message.author.id}>`, inline: true }
        )
       .setFooter({ text: 'Made by ©Dubblu' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error creating link:', error);
      message.reply('❌ An error occurred while creating the tracking link.');
    }
  }

  else if (command === 'stats') {
    if (args.length === 0) {
      return message.reply('❌ Usage: `!stats <link_id>`');
    }

    const linkId = args[0];
    const link = db.getLink(linkId);

    if (!link) {
      return message.reply('❌ Link not found.');
    }

    const clicks = db.getClickStats(linkId);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📊 Statistics for Link: ${linkId}`)
      .addFields(
        { name: '📁 Original URL', value: link.original_url.substring(0, 100) + (link.original_url.length > 100 ? '...' : ''), inline: false },
        { name: '👤 Created By', value: `<@${link.created_by}>`, inline: true },
        { name: '📅 Created At', value: `<t:${Math.floor(link.created_at / 1000)}:F>`, inline: true },
        { name: '👆 Total Clicks', value: clicks.length.toString(), inline: true }
      );

    if (clicks.length > 0) {
      const recentClicks = clicks.slice(0, 5).map(click => {
        const userTag = click.discord_discriminator && click.discord_discriminator !== '0'
          ? `${click.discord_username}#${click.discord_discriminator}`
          : click.discord_username;
        return `• ${userTag} (<@${click.discord_user_id}>) - <t:${Math.floor(click.timestamp / 1000)}:R>`;
      }).join('\n');

      embed.addFields({ name: '🕐 Recent Clicks', value: recentClicks, inline: false });
    } else {
      embed.addFields({ name: '🕐 Recent Clicks', value: 'No clicks yet', inline: false });
    }

    await message.reply({ embeds: [embed] });
  }

  else if (command === 'list') {
    const links = db.getAllLinks();

    if (links.length === 0) {
      return message.reply('📭 No tracked links found.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 All Tracked Links')
      .setDescription(`Total: ${links.length} links`);

    const linkList = links.slice(0, 10).map(link => {
      const clicks = db.getClickStats(link.id);
      return `**${link.id}** - ${clicks.length} clicks\n└ ${link.original_url.substring(0, 60)}${link.original_url.length > 60 ? '...' : ''}`;
    }).join('\n\n');

    embed.addFields({ name: 'Links', value: linkList || 'None', inline: false });

    if (links.length > 10) {
      embed.setFooter({ text: `Showing 10 of ${links.length} links. Use !stats <id> for details.` });
    }

    await message.reply({ embeds: [embed] });
  }

  else if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📖 Link Tracker Bot - Commands')
      .setDescription('Track who downloads your files with OAuth authentication')
      .addFields(
        { name: '!cn <url>', value: 'Create a new tracking link for a URL', inline: false },
        { name: '!stats <link_id>', value: 'View click statistics for a specific link', inline: false },
        { name: '!list', value: 'List all tracked links', inline: false },
        { name: '!help', value: 'Show this help message', inline: false }
      )
      .setFooter({ text: 'Made by ©Dubblu' });

    await message.reply({ embeds: [embed] });
  }
});

async function start() {
  try {
    db.initDatabase();
    startServer();
    await client.login(config.botToken);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  client.destroy();
  process.exit(0);
});

start();