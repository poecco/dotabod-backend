import RedisClient from '../../db/redis.js'
import { GSIHandler } from '../GSIHandler.js'
import { findItem } from './findItem.js'

const redisClient = RedisClient.getInstance()

export async function calculateManaSaved(dotaClient: GSIHandler) {
  const { treadsData } = dotaClient
  const data = dotaClient.client.gsi

  if (!data?.hero?.mana || !data.hero.max_mana) return
  const hasPowerTreads = findItem('item_power_treads', false, data)
  if (!hasPowerTreads || !hasPowerTreads[0]) return

  const maxMana = data.hero.max_mana
  const prevMaxMana = data.previously?.hero?.max_mana ?? 0

  const didToggleToInt = maxMana - prevMaxMana === 120
  const didToggleOffInt = maxMana - prevMaxMana === -120

  if (didToggleToInt) {
    treadsData.manaAtLastToggle = data.hero.mana

    await redisClient.client.json.set(`${dotaClient.getToken()}:treadtoggle`, '$', { treadsData })

    // Come back when we toggle off int
    return
  }

  // Calculate total mana saved
  if (didToggleOffInt) {
    const diff = treadsData.manaAtLastToggle - data.hero.mana - 120
    const mana = diff > 0 ? diff : 0
    if (mana > 0) {
      treadsData.treadToggles++
      treadsData.manaSaved += mana
    }

    await redisClient.client.json.set(`${dotaClient.getToken()}:treadtoggle`, '$', { treadsData })
    return
  }

  await redisClient.client.json.set(`${dotaClient.getToken()}:treadtoggle`, '$', { treadsData })
  return
}
