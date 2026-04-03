const axios = require('axios')
const { createChecker } = require('./createChecker')

async function fetchTokens() {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/coins/list'
  )
  return response.data
}

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

function formatTokenAlert(token) {
  // same formatAlert function as before
  const name = token.name
  const symbol = token.symbol.toUpperCase()
  const marketCap = token.market_data?.market_cap?.usd
    ? `$${Number(token.market_data.market_cap.usd).toLocaleString()}`
    : 'Not available'
  const volume = token.market_data?.total_volume?.usd
    ? `$${Number(token.market_data.total_volume.usd).toLocaleString()}`
    : 'Not available'
  const price = token.market_data?.current_price?.usd
    ? `$${token.market_data.current_price.usd}`
    : 'Not available'
  const genesisDate = token.genesis_date || 'Unknown'
  const website = token.links?.homepage?.[0] || null
  const twitter = token.links?.twitter_screen_name
    ? `https://twitter.com/${token.links.twitter_screen_name}`
    : null
  const telegram = token.links?.telegram_channel_identifier
    ? `https://t.me/${token.links.telegram_channel_identifier}`
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
  if (!website && !twitter && !telegram) message += `No social links available yet\n`

  return message
}

const checkNewTokens = createChecker({
  name: 'Tokens',
  fetchData: fetchTokens,
  getId: (token) => token.id,
  enrichItem: (token) => getTokenDetails(token.id), // ← new line
  formatAlert: formatTokenAlert,
})

module.exports = { checkNewTokens }