<svelte:window on:keydown="onKeydown(event)"/>

<div class="_header">
  <form class="_search" autocomplete="off">
    <svg><use xlink:href="#icon-search"/></svg>
    <input placeholder="Search..." class="input _search-input" bind:value=query on:input="search(this.value)" ref:input>
  </form>
</div>

{#if content || contentLoading}
<div class="_container" role="document">
  <div class="_content" role="main">
    {#if contentLoading}
    <div class="_page">
      <div class="_content-loading"></div>
    </div>
    {:else}
    <div class="_page _angular" ref:page>
      {@html content}
    </div>
    {/if}
  </div>
</div>
{:elseif results.length}
<div class="_sidebar">
  <div class="_list" ref:list>
    {#each results as result, i}
      <div class="_list-item _list-hover _list-result _icon-{result.category.split('~')[0]} {focusPos === i ? 'focus' : ''}" on:click="open(result)">
        <div class="_list-count">{result.version}</div>
        <div class="_list-text">{result.name}</div>
      </div>
    {/each}
  </div>
</div>
{:else}
<div class="_container" role="document">
  <div class="_content" role="main">
    <div>
      <div class="_splash-title">DevDocs Web Ext</div>
    </div>
  </div>
</div>
{/if}

<svg class="_settings" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <symbol id="icon-search" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></symbol>
  </defs>
</svg>

<script>
import browser from 'webextension-polyfill'

export default {
  data () {
    return {
      query: '',
      focusPos: 0,
      results: [],
      content: '',
      contentLoading: false
    }
  },
  async oncreate () {
    window.app = this
    const {input} = this.refs

    input.focus()

    const code = 'getSelection().toString().trim().slice(0, 50)'
    const [selection] = await browser.tabs.executeScript({code})
    if (selection) {
      this.set({query: selection})
      input.dispatchEvent(new Event('input'))
    } else {
      const lastViewed = JSON.parse(localStorage.getItem('lastViewed') || '{}')
      if (lastViewed.query) {
        this.set({query: lastViewed.query})
        input.select()
      }
      switch (lastViewed.type) {
        case 'list':
          input.dispatchEvent(new Event('input'))
          break
        case 'page':
          this.set({contentLoading: true})
          setTimeout(() => {
            this.open(lastViewed.result)
          }, 50)
          break
      }
    }
  },
  computed: {
    focusResult ({results, focusPos}) {
      return results[focusPos]
    },
    maxFocusPos ({results}) {
      return results.length - 1
    }
  },
  methods: {
    onKeydown (event) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          this.focusPrevResult()
          break
        case 'ArrowDown':
          event.preventDefault()
          this.focusNextResult()
          break
        case 'Tab':
          const {content, results} = this.get()
          if (content) {
            event.preventDefault()
            if (event.shiftKey) {
              this.scrollToPrevPage()
            } else {
              this.scrollToNextPage()
            }
          } else if (results.length) {
            event.preventDefault()
            if (event.shiftKey) {
              this.focusPrevResult()
            } else {
              this.focusNextResult()
            }
          }
          break
        case 'f':
          if (event.ctrlKey) {
            event.preventDefault()
            this.scrollToNextPage()
          }
          break
        case 'b':
          if (event.ctrlKey) {
            event.preventDefault()
            this.scrollToPrevPage()
          }
          break
        case '/':
          const {input} = this.refs
          if (event.target !== input) {
            event.preventDefault()
            input.focus()
            input.select()
          }
          break
        case 'Enter':
          event.preventDefault()
          this.openFocusResult()
          break
      }
    },
    focusNextResult () {
      const {focusPos, maxFocusPos} = this.get()
      this.set({focusPos: focusPos === maxFocusPos ? 0 : focusPos + 1})
      this.refs.list.children[this.get().focusPos].scrollIntoView({behavior: 'smooth'})
    },
    focusPrevResult () {
      const {focusPos, maxFocusPos} = this.get()
      this.set({focusPos: focusPos === 0 ? maxFocusPos : focusPos - 1})
      this.refs.list.children[this.get().focusPos].scrollIntoView({behavior: 'smooth'})
    },
    async search (query) {
      this.set({content: ''})

      localStorage.setItem('lastViewed', JSON.stringify({
        type: 'list',
        query,
        content: ''
      }))

      const results = await browser.runtime.sendMessage(query) || []
      this.set({results, focusPos: 0})

      if (this.refs.list) {
        this.refs.list.scrollTo(0, 0)
      }
    },
    openFocusResult () {
      this.open(this.get().focusResult)
    },
    scrollToNextPage () {
      const {page} = this.refs
      page.style['scroll-behavior'] = 'smooth'
      page.scrollTo(0, page.scrollTop + app.refs.page.offsetHeight)
      delete page.style['scroll-behavior']
    },
    scrollToPrevPage () {
      const {page} = this.refs
      page.style['scroll-behavior'] = 'smooth'
      page.scrollTo(0, page.scrollTop - app.refs.page.offsetHeight)
      delete page.style['scroll-behavior']
    },
    async open (result) {
      if (!result) return
      const [resultPath, resultHash] = result.path.split('#')
      const pathAndHash = resultHash ? `${resultPath}.html#${resultHash}` : `${resultPath}.html`
      const contentUrl = `http://maxcdn-docs.devdocs.io/${result.category}/${pathAndHash}`
      this.set({contentLoading: true})

      this.refs.input.select()

      const res = await fetch(contentUrl)
      const content = await res.text()

      this.set({
        content,
        contentLoading: false
      })

      localStorage.setItem('lastViewed', JSON.stringify({
        type: 'page',
        result,
        query: this.get().query
      }))

      const {page} = this.refs
      page.scrollTo(0, 0)

      if (resultHash) {
        const scrollTargetId = resultHash.includes('.') ? resultHash.slice(1) : resultHash
        const scrollTarget = document.getElementById(scrollTargetId)
        if (scrollTarget) {
          page.scrollTo(0, scrollTarget.offsetTop)
        }
      }
    }
  }
}
</script>
