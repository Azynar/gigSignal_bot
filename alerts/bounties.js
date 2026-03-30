const axios = require('axios')
const { createChecker } = require('./createChecker')

async function fetchBounties() {
  const response = await axios.get(
    'https://superteam.fun/api/listings?context=home&tab=all&category=All&status=open&sortBy=Date&order=asc&region=&sponsor='
  )
  return response.data
}

function formatBountyAlert(bounty) {
  const link = `https://earn.superteam.fun/listings/${bounty.slug}`
  const deadline = bounty.deadline
    ? new Date(bounty.deadline).toDateString()
    : 'No deadline'

  let message = `🏆 <b>New Web3 Bounty!</b>\n\n`
  message += `📌 <b>Title:</b> ${bounty.title}\n`
  message += `💰 <b>Reward:</b> ${bounty.rewardAmount} ${bounty.token}\n`
  message += `🏷️ <b>Type:</b> ${bounty.type}\n`
  message += `⏰ <b>Deadline:</b> ${deadline}\n\n`
  message += `🔗 <a href="${link}">Apply Here</a>`

  return message
}

const checkNewBounties = createChecker({
  name: 'Bounties',
  fetchData: fetchBounties,
  getId: (bounty) => bounty.id,
  formatAlert: formatBountyAlert,
})

module.exports = { checkNewBounties }