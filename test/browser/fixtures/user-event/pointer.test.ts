import { test, vi } from 'vitest'
import { userEvent, page } from 'vitest/browser'

type PointerAction = (event: PointerEvent) => void

test('clicks a button', async ({ expect }) => {
  document.body.innerHTML = `
    <div style="padding: 1rem;">
      <button>Button</button>
    </div>
  `;

  const hover = vi.fn<PointerAction>()
  const click = vi.fn<PointerAction>()

  const buttonElement = document.body.querySelector('button')

  buttonElement.addEventListener('mouseenter', hover)
  buttonElement.addEventListener('click', click)

  const target = page.getByRole("button")

  await userEvent.pointer([
    { target, keys: '{ShiftRight}', action: 'click' },
  ])

  expect(hover).toHaveBeenCalledOnce()
  expect(click).toHaveBeenCalledOnce()

  expect(hover).toHaveBeenCalledBefore(click)

  expect(click).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'click',
      button: 0,
      shiftKey: true,
    })
  )
})
