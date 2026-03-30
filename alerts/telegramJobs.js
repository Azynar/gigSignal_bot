const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')

const apiId = parseInt(process.env.TELEGRAM_API_ID)
const apiHash = process.env.TELEGRAM_API_HASH

const CHANNELS = [
  'Web3Jobs',
  'cryptojobslist',
  'DeFiJobs',
]

const seenMessages = new Set()
let client = null

async function initTelegramClient() {
  const session = new StringSession(process.env.TELEGRAM_SESSION || '')

  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  })

  await client.start({
    phoneNumber: async () => await input.text('Enter your phone number: '),
    password: async () => await input.text('Enter your 2FA password (if any): '),
    phoneCode: async () => await input.text('Enter the code you received: '),
    onError: (err) => console.log('Auth error:', err),
  })

  console.log('Telegram client connected!')
  console.log('SESSION STRING:', client.session.save())
  console.log('Copy the session string above and add it to your .env as TELEGRAM_SESSION=...')
}

async function checkTelegramJobs(sendAlert) {
  try {
    if (!client) {
      console.log('Telegram client not initialized')
      return
    }

    for (const channel of CHANNELS) {
      try {
        const messages = await client.getMessages(channel, { limit: 5 })

        for (const message of messages) {
          const messageId = `${channel}-${message.id}`

          if (!seenMessages.has(messageId) && message.text) {
            seenMessages.add(messageId)

            const isJob = /job|hiring|role|position|engineer|developer|writer|remote|apply/i.test(message.text)

            if (isJob) {
              const channelUrl = `https://t.me/${channel}/${message.id}`

              let alert = `💼 <b>New Web3 Job Alert!</b>\n\n`
              alert += `📢 <b>Channel:</b> @${channel}\n\n`
              alert += `📝 <b>Post:</b>\n${message.text.slice(0, 300)}${message.text.length > 300 ? '...' : ''}\n\n`
              alert += `🔗 <a href="${channelUrl}">View Full Post</a>`

              await sendAlert(alert)
            }
          }
        }
      } catch (err) {
        console.log(`Could not read channel @${channel}:`, err.message)
      }
    }

    console.log('Telegram jobs: Check complete.')

  } catch (error) {
    console.log('Error checking Telegram jobs:', error.message)
  }
}

module.exports = { initTelegramClient, checkTelegramJobs }