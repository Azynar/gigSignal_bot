const axios = require('axios')

const seenBounties = new Set()
let isFirstBountyRun = true

async function checkNewBounties(sendAlert) {
  try {
    const response = await axios.get(
      'https://superteam.fun/api/listings?context=home&tab=all&category=All&status=open&sortBy=Date&order=asc&region=&sponsor='
    )

    const bounties = response.data
    let newBountiesFound = 0

    for (const bounty of bounties) {
      if (!seenBounties.has(bounty.id)) {
        seenBounties.add(bounty.id)

        if (!isFirstBountyRun) {
          const link = `https://earn.superteam.fun/listings/${bounty.slug}`

          const deadline = bounty.deadline
            ? new Date(bounty.deadline).toDateString()
            : 'No deadline'

          const message =
            `🏆 <b>New Web3 Bounty!</b>\n\n` +
            `📌 <b>Title:</b> ${bounty.title}\n` +
            `💰 <b>Reward:</b> ${bounty.rewardAmount} ${bounty.token}\n` +
            `🏷️ <b>Type:</b> ${bounty.type}\n` +
            `⏰ <b>Deadline:</b> ${deadline}\n\n` +
            `🔗 <a href="${link}">Apply Here</a>`

          await sendAlert(message)
          newBountiesFound++
        }
      }
    }

    if (isFirstBountyRun) {
      console.log(`Bounties: First run complete. ${seenBounties.size} bounties saved as baseline.`)
      isFirstBountyRun = false
    } else {
      console.log(`Bounties: Check complete. ${newBountiesFound} new bounty(s) found.`)
    }

  } catch (error) {
    console.log('Error checking bounties:', error.message)
  }
}

module.exports = { checkNewBounties }