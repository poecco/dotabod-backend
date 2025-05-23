import { t } from 'i18next'

import { getHeroNameOrColor } from '../../dota/lib/heroes.js'
import { DBSettings } from '../../settings.js'
import { chatClient } from '../chatClient.js'
import commandHandler, { type MessageType } from '../lib/CommandHandler.js'
import { profileLink } from './profileLink.js'

commandHandler.registerCommand('opendota', {
  dbkey: DBSettings.commandOpendota,
  handler: async (message: MessageType, args: string[], command) => {
    const {
      channel: { name: channelName, client: channelClient },
    } = message

    try {
      if (!args.length && channelClient.steam32Id) {
        chatClient.say(
          channelName,
          t('profileUrl', {
            channel: channelClient.name,
            lng: channelClient.locale,
            url: `opendota.com/players/${channelClient.steam32Id}`,
          }),
          message.user.messageId,
        )
        return
      }

      const { hero, playerIdx, player } = await profileLink({
        command,
        packet: channelClient.gsi,
        locale: channelClient.locale,
        args: args,
      })

      if (player?.accountid) {
        chatClient.say(
          channelName,
          t('profileUrl', {
            channel:
              player?.accountid === channelClient.steam32Id
                ? channelClient.name
                : getHeroNameOrColor(hero?.id ?? 0, playerIdx),
            lng: channelClient.locale,
            url: `opendota.com/players/${player.accountid.toString()}`,
          }),
          message.user.messageId,
        )
        return
      }
    } catch (e: any) {
      chatClient.say(
        message.channel.name,
        e?.message ?? t('gameNotFound', { lng: message.channel.client.locale }),
        message.user.messageId,
      )
    }
  },
})
