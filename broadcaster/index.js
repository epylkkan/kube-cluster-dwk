const os = require("os");

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const chat_id = process.env.CHAT_ID
const host = os.hostname();

const { connect, StringCodec } = require("nats");
const natsHost = process.env.NATS || '';
const sc = StringCodec();

let nc = null; 
let todoContent = null; 
const connectToNats = async () => 
{
    console.log(natsHost)   
    try { 
       nc = await connect({ servers: natsHost, json: true })
       console.log("Connected to nats successfully")
        const sub = nc.subscribe("todos");
        (async () => {
          for await (const m of sub) {
           //console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);           
           console.log (`${sc.decode(m.data)}`);
           todoContent = JSON.parse(`${sc.decode(m.data)}`);
           console.log (todoContent)
          await sendToTelegram(todoContent);
          }
          console.log("subscription closed");
        })();
    } catch(err) {
      console.log(err)
      console.log("Nats connection failed")
    }
    //await nc.drain();
}
connectToNats()

const sendToTelegram = async (msg) => {
  let text = "";
  if (msg.method === "PUT") text = "Todo was updated:";
  if (msg.method === "POST") text = "Todo was created:";
  if (msg.method === "DELETE") text = "Todo was deleted:";
  let jsondata = JSON.stringify(msg, undefined, 2);
  if (!chat_id) return;
  try {
    await bot.telegram.sendMessage(
      chat_id,
      `
      <b>TODOS NATS BROADCASTER</b>
      <a>${text}</a>
      <pre id="json">${jsondata}</pre>
      `,
      {
        parse_mode: "HTML",
      }
    );
  } catch (e) {
    console.log(e);
  }
};
