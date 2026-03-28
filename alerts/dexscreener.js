const axios = require('axios')
const { createChecker } = require('./createChecker')

async function fetchDexTokens() {
  const response = await axios.get(
    'https://api.dexscreener.com/token-profiles/latest/v1'
  )
  return response.data
}

function formatDexAlert(token) {
  const chain = token.chainId?.toUpperCase() || 'Unknown'
  const address = token.tokenAddress || 'Unknown'
  const description = token.description || 'No description available'
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

const checkDexScreener = createChecker({
  name: 'DexScreener',
  fetchData: fetchDexTokens,
  getId: (token) => `${token.chainId}-${token.tokenAddress}`,
  formatAlert: formatDexAlert,
})

module.exports = { checkDexScreener }