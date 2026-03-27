const axios = require('axios')

const seenDexTokens = new Set()
let isFirstDexRun = true

async function checkDexScreener(sendAlert) {
  try {
    const response = await axios.get(
      'https://api.dexscreener.com/token-profiles/latest/v1'
    )

    const tokens = response.data
    let newTokensFound = 0

    for (const token of tokens) {
      const uniqueId = `${token.chainId}-${token.tokenAddress}`

      if (!seenDexTokens.has(uniqueId)) {
        seenDexTokens.add(uniqueId)

        if (!isFirstDexRun) {
          const message = formatDexAlert(token)
          await sendAlert(message)
          newTokensFound++
        }
      }
    }

    if (isFirstDexRun) {
      console.log(`DexScreener: First run complete. ${seenDexTokens.size} tokens saved as baseline.`)
      isFirstDexRun = false
    } else {
      console.log(`DexScreener: Check complete. ${newTokensFound} new token(s) found.`)
    }

  } catch (error) {
    console.log('Error checking DexScreener:', error.message)
  }
}

function formatDexAlert(token) {
  const chain = token.chainId?.toUpperCase() || 'Unknown'
  const address = token.tokenAddress || 'Unknown'
  const description = token.description || 'No description available'

  // Extract socials
  const twitter = token.links?.find(link => link.type === 'twitter')?.url || null
  const telegram = token.links?.find(link => link.type === 'telegram')?.url || null
  const website = token.links?.find(link => link.type === 'website')?.url || null

  const dexUrl = `https://dexscreener.com/${token.chainId}/${token.tokenAddress}`

  let message = `🔥 <b>New Token on DexScreener!</b>\n\n`
  message += `⛓️ <b>Chain:</b> ${chain}\n`
  message += `📝 <b>Description:</b> ${description}\n`
  message += `📋 <b>Contract:</b> <code>${address}</code>\n\n`
  message += `🔗 <b>Links:</b>\n`
  message += `📊 <a href="${dexUrl}">View on DexScreener</a>\n`

  if (website) message += `🌐 <a href="${website}">Website</a>\n`
  if (twitter) message += `🐦 <a href="${twitter}">Twitter/X</a>\n`
  if (telegram) message += `✈️ <a href="${telegram}">Telegram</a>\n`

  return message
}

module.exports = { checkDexScreener }