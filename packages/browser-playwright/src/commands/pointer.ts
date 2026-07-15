import type { SerializedUserEventPointerOptions } from 'vitest/browser'
import type { UserEventCommand } from './utils'
import { parseKeyDef } from '@vitest/browser'
import { hover } from './hover'

type PointerCommand = (options: readonly SerializedUserEventPointerOptions[]) => void

export const pointer: UserEventCommand<PointerCommand> = async (
  context,
  options,
) => {
  const pressedKeys = new Set<string>()

  for (const option of options) {
    const keys = option.keys === undefined ? null : parseKeyDef(option.keys)

    if (keys) {
      const keysToRelease = new Set<string>()

      for (const { keyDef, releaseSelf, releasePrevious } of keys) {
        const key = keyDef.key!

        await context.page.keyboard.down(key)

        if (releaseSelf) {
          keysToRelease.add(key)
        }
        else {
          pressedKeys.add(key)
        }

        if (releasePrevious && pressedKeys.has(key)) {
          keysToRelease.add(key)
        }
      }

      if (option.target) {
        await hover(context, option.target)
      }
      else {
        await context.page.mouse.move(option.coordinates.x, option.coordinates.y)
      }

      if (option.action) {
        const options = {
          button: option.button
        }

        switch (option.action) {
          case 'down':
            await context.page.mouse.down(options)
            break
          case 'up':
            await context.page.mouse.up(options)
            break
          case 'click':
            await context.page.mouse.down(options)
            await context.page.mouse.up(options)
            break
        }
      }

      for (const key of keysToRelease) {
        await context.page.keyboard.up(key)
      }
    }
  }
}
