import test from 'ava'
import { getTestContext, TestContext } from './helpers'

test.serial.before(async t => {
  t.context = await getTestContext()
})

test.serial('update size', async t => {
  const { optionPage, popupPage } = t.context as TestContext
  await optionPage.bringToFront()
  const thumbs = await optionPage.$$('.mdc-slider__thumb-container')

  for (const thumb of thumbs) {
    const boundingBox = await thumb!.boundingBox()
    const thumbX = boundingBox!.x + boundingBox!.width / 2
    const thumbY = boundingBox!.y + boundingBox!.height / 2
    await optionPage.mouse.move(thumbX, thumbY)
    await optionPage.mouse.down()
    await optionPage.mouse.move(thumbX - 100, thumbY)
    await optionPage.mouse.up()
    await optionPage.waitFor(100)
  }

  await popupPage.bringToFront()
  await popupPage.reload({ waitUntil: 'networkidle2' })
  const size = {
    width: await popupPage.$eval('body', e => (e as HTMLBodyElement).offsetWidth),
    height: await popupPage.$eval('body', e => (e as HTMLBodyElement).offsetHeight)
  }
  t.deepEqual(size, { width: 450, height: 450 })
})

test.serial('update theme', async t => {
  function isChecked (e: Element) {
    return (e as HTMLInputElement).checked
  }

  const { optionPage, popupPage } = t.context as TestContext

  if (await optionPage.$eval('input[value=light]', isChecked)) {
    t.false(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))

    await optionPage.bringToFront()
    t.true(await optionPage.$eval('input[value=light]', isChecked))
    t.false(await optionPage.$eval('input[value=dark]', isChecked))

    await optionPage.click('input[value=dark]')
    await optionPage.waitFor(100)
    await optionPage.reload({ waitUntil: 'networkidle2' })
    t.false(await optionPage.$eval('input[value=light]', isChecked))
    t.true(await optionPage.$eval('input[value=dark]', isChecked))

    await popupPage.bringToFront()
    await popupPage.reload({ waitUntil: 'networkidle2' })
    t.true(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))
  } else {
    t.true(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))

    await optionPage.bringToFront()
    t.false(await optionPage.$eval('input[value=light]', isChecked))
    t.true(await optionPage.$eval('input[value=dark]', isChecked))

    await optionPage.click('input[value=light]')
    await optionPage.waitFor(100)
    await optionPage.reload({ waitUntil: 'networkidle2' })
    t.true(await optionPage.$eval('input[value=light]', isChecked))
    t.false(await optionPage.$eval('input[value=dark]', isChecked))

    await popupPage.bringToFront()
    await popupPage.reload({ waitUntil: 'networkidle2' })
    t.false(await popupPage.$eval('html', (e) => e.classList.contains('_theme-dark')))
  }
})

test.serial.after(async t => {
  (t.context as TestContext).browser.close()
})
