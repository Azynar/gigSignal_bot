const axios = require('axios')

const seenTokens = new Set()
let isFirstRun = true

async function getTokenDetails(tokenId) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&community_data=false&developer_data=false`
    )
    return response.data
  } catch (error) {
    console.log(`Could not fetch details for ${tokenId}:`, error.message)
    return null
  }
}

function formatAlert(details) {
  const name = details.name
  const symbol = details.symbol.toUpperCase()

  const marketCap = details.market_data?.market_cap?.usd
    ? `$${Number(details.market_data.market_cap.usd).toLocaleString()}`
    : 'Not available'

  const volume = details.market_data?.total_volume?.usd
    ? `$${Number(details.market_data.total_volume.usd).toLocaleString()}`
    : 'Not available'

  const price = details.market_data?.current_price?.usd
    ? `$${details.market_data.current_price.usd}`
    : 'Not available'

  const genesisDate = details.genesis_date
    ? details.genesis_date
    : 'Unknown'

  const website = details.links?.homepage?.[0]
    ? details.links.homepage[0]
    : null

  const twitter = details.links?.twitter_screen_name
    ? `https://twitter.com/${details.links.twitter_screen_name}`
    : null

  const telegram = details.links?.telegram_channel_identifier
    ? `https://t.me/${details.links.telegram_channel_identifier}`
    : null

  const detectedAt = new Date().toLocaleString()

  let message = `🚀 <b>New Token Detected!</b>\n\n`
  message += `🪙 <b>Name:</b> ${name} (${symbol})\n`
  message += `💰 <b>Price:</b> ${price}\n`
  message += `📊 <b>Market Cap:</b> ${marketCap}\n`
  message += `📈 <b>24h Volume:</b> ${volume}\n`
  message += `📅 <b>Launch Date:</b> ${genesisDate}\n`
  message += `🕐 <b>Detected At:</b> ${detectedAt}\n\n`
  message += `🔗 <b>Links:</b>\n`

  if (website) message += `🌐 <a href="${website}">Website</a>\n`
  if (twitter) message += `🐦 <a href="${twitter}">Twitter/X</a>\n`
  if (telegram) message += `✈️ <a href="${telegram}">Telegram</a>\n`

  if (!website && !twitter && !telegram) {
    message += `No social links available yet\n`
  }

  return message
}

async function checkNewTokens(sendAlert) {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/list'
    )

    const tokens = response.data
    let newTokensFound = 0

    for (const token of tokens) {
      if (!seenTokens.has(token.id)) {
        seenTokens.add(token.id)

        if (!isFirstRun) {
          const details = await getTokenDetails(token.id)
          if (details) {
            const message = formatAlert(details)
            await sendAlert(message)
            newTokensFound++
          }
        }
      }
    }

    if (isFirstRun) {
      console.log(`Tokens: First run complete. ${seenTokens.size} tokens saved as baseline.`)
      isFirstRun = false
    } else {
      console.log(`Tokens: Check complete. ${newTokensFound} new token(s) found.`)
    }

  } catch (error) {
    console.log('Error checking tokens:', error.message)
  }
}

module.exports = { checkNewTokens }