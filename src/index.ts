import { Manager } from "./manager.js";
const client = new Manager();
client.connect();
client.on("debug", (log: any) => console.log(log))