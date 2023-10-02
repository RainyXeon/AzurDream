import chalk from "chalk";
import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  const lavalink = chalk.hex("#ffc61c");
  const distube_mess = lavalink("Distube: ");
  client.logger.data_loader(distube_mess + `Setting up data for distube...`);
  client.logger.data_loader(
    distube_mess + `Auto ReConnect Collecting player 24/7 data`,
  );
  const maindata = await client.db.get(`autoreconnect`);

  if (!maindata) {
    client.logger.data_loader(
      distube_mess + `Auto ReConnect found in 0 servers!`,
    );
    client.logger.data_loader(
      distube_mess + `Setting up data for distube complete!`,
    );
    return;
  }

  client.logger.data_loader(
    distube_mess +
      `Auto ReConnect found in ${Object.keys(maindata).length} servers!`,
  );
  if (Object.keys(maindata).length === 0) return;

  client.logger.data_loader(
    distube_mess + `Lavalink avalible, remove interval and continue setup!`,
  );

  await Object.keys(maindata).forEach(async function (key, index) {
    const data = maindata[key];

    setTimeout(async () => {
      const channel = client.channels.cache.get(data.text);
      const voice = client.channels.cache.get(data.voice);
      if (!channel || !voice) return client.db.delete(`autoreconnect.${key}`);
      await client.manager.voices.join(data.voice);
    }),
      index * 5000;
  });

  client.logger.data_loader(
    distube_mess +
      `Reconnected to all ${Object.keys(maindata).length} servers!`,
  );

  client.logger.data_loader(
    distube_mess + `Setting up data for distube complete!`,
  );
};
