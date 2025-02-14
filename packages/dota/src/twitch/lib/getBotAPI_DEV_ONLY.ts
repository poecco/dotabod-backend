import { ApiClient } from '@twurple/api'

import { logger } from '../../utils/logger.js'
import { getAuthProvider } from './getAuthProvider.js'
import { getBotTokens } from './getBotTokens.js'

export const getBotAPI_DEV_ONLY = async function () {
  const authProvider = getAuthProvider()
  const botTokens = await getBotTokens()

  const twitchId = process.env.TWITCH_BOT_PROVIDERID!

  if (!botTokens?.access_token || !botTokens.refresh_token) {
    logger.info('[TWITCHSETUP] Missing bot tokens', {
      twitchId,
    })
    return false
  }

  const tokenData = {
    scope: botTokens.scope?.split(' ') ?? [],
    expiresIn: botTokens.expires_in ?? 0,
    obtainmentTimestamp: botTokens.obtainment_timestamp?.getTime() ?? 0,
    accessToken: botTokens.access_token,
    refreshToken: botTokens.refresh_token,
  }

  authProvider.addUser(twitchId, tokenData, ['chat'])

  const api = new ApiClient({ authProvider })
  logger.info('[TWITCH] Retrieved twitch dotabod api')

  return api
}
