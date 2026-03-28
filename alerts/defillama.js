const axios = require('axios')
const { createChecker } = require('./createChecker')

async function fetchProtocols() {
  const response = await axios.get('https://api.llama.fi/protocols')
  return response.data
}

function formatProtocolAlert(protocol) {
  const name = protocol.name || 'Unknown'
  const category = protocol.category || 'Unknown'
  const chains = protocol.chains?.join(', ') || 'Unknown'
  const tvl = protocol.tvl
    ? `$${Number(protocol.tvl).toLocaleString()}`
    : 'Not available'
  const url = protocol.url || null
  const twitter = protocol.twitter
    ? `https://twitter.com/${protocol.twitter}`
    : null
  const defiLlamaUrl = `https://defillama.com/protocol/${protocol.slug}`

  let message = `🦙 <b>New Protocol on DeFi Llama!</b>\n\n`
  message += `📌 <b>Name:</b> ${name}\n`
  message += `🏷️ <b>Category:</b> ${category}\n`
  message += `⛓️ <b>Chains:</b> ${chains}\n`
  message += `💰 <b>TVL:</b> ${tvl}\n\n`
  message += `🔗 <b>Links:</b>\n`
  message += `🦙 <a href="${defiLlamaUrl}">View on DeFi Llama</a>\n`
  if (url) message += `🌐 <a href="${url}">Website</a>\n`
  if (twitter) message += `🐦 <a href="${twitter}">Twitter/X</a>\n`

  return message
}

const checkNewProtocols = createChecker({
  name: 'DeFiLlama',
  fetchData: fetchProtocols,
  getId: (protocol) => protocol.id,
  formatAlert: formatProtocolAlert,
})

module.exports = { checkNewProtocols }