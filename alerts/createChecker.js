function createChecker(options) {
  const {
    name,
    fetchData,
    getId,
    formatAlert,
    enrichItem, // ← new optional option
  } = options

  const seenItems = new Set()
  let isFirstRun = true

  return async function runChecker(sendAlert) {
    try {
      const items = await fetchData()
      let newItemsFound = 0

      for (const item of items) {
        const id = getId(item)

        if (!seenItems.has(id)) {
          seenItems.add(id)

          if (!isFirstRun) {
            const enrichedItem = enrichItem ? await enrichItem(item) : item // ← new line
            if (!enrichedItem) continue // ← skip if enrichment failed
            const message = formatAlert(enrichedItem) // ← now uses enriched data
            await sendAlert(message)
            newItemsFound++
          }
        }
      }

      if (isFirstRun) {
        console.log(`${name}: First run complete. ${seenItems.size} items saved as baseline.`)
        isFirstRun = false
      } else {
        console.log(`${name}: Check complete. ${newItemsFound} new item(s) found.`)
      }

    } catch (error) {
      console.log(`${name} error:`, error.message)
    }
  }
}

module.exports = { createChecker }