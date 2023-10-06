import {
  Client,
  GatewayIntentBits,
  Collection,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
} from "discord.js";
import { connectDB } from "./database/index.js";
import { I18n } from "@hammerhq/localization";
import { resolve } from "path";
import * as configData from "./plugins/config.js";
import winstonLogger from "./plugins/logger.js";
import { DisTube, Queue, StreamType } from "distube";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { QuickDB } from "quick.db";
import { WebServer } from "./webserver/index.js";
import WebSocket from "ws";
import { DeezerPlugin } from "@distube/deezer";
const __dirname = dirname(fileURLToPath(import.meta.url));

winstonLogger.info("Booting client...");
type ChannelMessageDataType = {
  channel: string;
  message: string;
};

export class Manager extends Client {
  // Interface
  token: string;
  config: Record<string, any>;
  logger: any;
  db!: QuickDB;
  owner: string;
  dev: string[];
  color: ColorResolvable;
  i18n: I18n;
  prefix: string;
  shard_status: boolean;
  manager: DisTube;
  slash: Collection<string, any>;
  commands: Collection<string, any>;
  premiums: Collection<string, any>;
  interval: Collection<string, any>;
  sent_queue: Collection<string, any>;
  aliases: Collection<string, any>;
  websocket?: WebSocket;
  // UpdateMusic = end
  UpdateMusic!: (player: Queue) => Promise<void | Message<true>>;
  // UpdateQueueMsg = start
  UpdateQueueMsg!: (player: Queue) => Promise<void | Message<true>>;
  enSwitch!: ActionRowBuilder<ButtonBuilder>;
  diSwitch!: ActionRowBuilder<ButtonBuilder>;
  is_db_connected: boolean;
  ws_message?: Collection<string, any>;
  queue_message: Collection<string, ChannelMessageDataType>;
  query_message: Collection<string, any>;
  is_using_import: Collection<string, any>;

  // Main class
  constructor() {
    super({
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: configData.default.features.MESSAGE_CONTENT.enable
        ? [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ]
        : [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
          ],
    });
    this.logger = winstonLogger;
    this.config = configData.default;

    this.token = this.config.bot.TOKEN;
    this.owner = this.config.bot.OWNER_ID;
    this.dev = this.config.bot.DEV_ID;
    this.color = this.config.bot.EMBED_COLOR || "#2b2d31";
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "languages")),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.prefix || "d!";
    this.shard_status = false;

    this.config.features.WEB_SERVER.websocket.enable
      ? (this.ws_message = new Collection())
      : undefined;

    // Collections
    this.slash = new Collection();
    this.commands = new Collection();
    this.premiums = new Collection();
    this.interval = new Collection();
    this.sent_queue = new Collection();
    this.aliases = new Collection();
    this.queue_message = new Collection();
    this.query_message = new Collection();
    this.is_using_import = new Collection();
    this.is_db_connected = false;

    process.on("unhandledRejection", (error) =>
      this.logger.log({ level: "error", message: error }),
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: error }),
    );

    if (
      this.config.features.WEB_SERVER.websocket.enable &&
      (!this.config.features.WEB_SERVER.websocket.secret ||
        this.config.features.WEB_SERVER.websocket.secret.length == 0)
    ) {
      this.logger.error("Must have secret in your ws config for secure!");
      process.exit();
    }

    this.manager = new DisTube(this, {
      leaveOnStop: false,
      leaveOnEmpty: false,
      leaveOnFinish: false,
      emitNewSongOnly: false,
      emitAddSongWhenCreatingQueue: true,
      emitAddListWhenCreatingQueue: true,
      streamType: StreamType.RAW,
      ytdlOptions: {
        highWaterMark: 1024 * 1024 * 64,
        quality: "lowestaudio",
        filter: "audioonly",
        liveBuffer: 60000,
        dlChunkSize: 1024 * 1024 * 4,
      },
      plugins: [
        this.config.distube.SPOTIFY.enable
          ? new SpotifyPlugin({
              emitEventsAfterFetching: true,
              api: {
                clientId: this.config.distube.SPOTIFY.id,
                clientSecret: this.config.distube.SPOTIFY.secret,
              },
            })
          : new SpotifyPlugin({
              emitEventsAfterFetching: true,
            }),
        new YtDlpPlugin({ update: true }),
        new SoundCloudPlugin(),
        new DeezerPlugin(),
      ],
    });
    if (this.config.features.WEB_SERVER.enable) {
      WebServer(this);
    }
    const loadFile = [
      "loadEvents.js",
      "loadPlayer.js",
      // "loadWebsocket.js",
      "loadCommand.js",
    ];
    // if (!this.config.features.WEB_SERVER.websocket.enable)
    //   loadFile.splice(loadFile.indexOf("loadWebsocket.js"), 1);
    loadFile.forEach(async (x) => {
      (await import(`./handlers/${x}`)).default(this);
    });

    connectDB(this);
  }

  connect() {
    super.login(this.token);
  }
}
