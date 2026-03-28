require('dotenv').config()
const { Telegraf } = require('telegraf')
const cron = require('node-cron')
const { checkNewTokens } = require('./alerts/tokens')
const { checkNewBounties } = require('./alerts/bounties')
const { checkDexScreener } = require('./alerts/dexscreener')
const { checkNewProtocols } = require('./alerts/defillama')

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

const bot = new Telegraf(BOT_TOKEN)

async function sendAlert(message) {
  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' })
    console.log('Alert sent!')
  } catch (error) {
    console.log('Failed to send alert:', error.message)
  }
}

bot.start((ctx) => {
  ctx.reply('Hey! Your Alert Bot is alive 🚀')
})

bot.launch().catch((err) => {
  console.log('Bot launch error:', err.message)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log('Bot is running...')

sendAlert('🚨 Alert Bot is online and watching for opportunities!')

checkNewTokens(sendAlert)
checkNewBounties(sendAlert)
checkDexScreener(sendAlert)
checkNewProtocols(sendAlert)

cron.schedule('*/10 * * * *', () => {
  console.log('Running scheduled check...')
  checkNewTokens(sendAlert)
  checkNewBounties(sendAlert)
  checkDexScreener(sendAlert)
  checkNewProtocols(sendAlert)
})