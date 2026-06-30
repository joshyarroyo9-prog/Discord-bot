const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

require("dotenv").config();
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.get(config.autoRole);
    if (role) member.roles.add(role);

    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("Welcome!")
      .setDescription(`Welcome ${member}! Verify below.`)
      .setColor("Pink");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify")
        .setLabel("Verify")
        .setStyle(ButtonStyle.Success)
    );

    channel.send({ embeds: [embed], components: [row] });
  } catch (e) {
    console.log(e);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "verify") {
    const role = interaction.guild.roles.cache.get(config.verifyRole);
    if (role) await interaction.member.roles.add(role);

    interaction.reply({ content: "Verified!", ephemeral: true });
  }
});

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Ping bot"),
  new SlashCommandBuilder().setName("rules").setDescription("Rules")
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("Commands ready");
  } catch (e) {
    console.log(e);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    interaction.reply(`Pong ${client.ws.ping}ms`);
  }

  if (interaction.commandName === "rules") {
    interaction.reply("Be kind, no spam, respect everyone.");
  }
});

client.login(process.env.TOKEN);
