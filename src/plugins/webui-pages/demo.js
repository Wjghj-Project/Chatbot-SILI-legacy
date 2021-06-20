import { router } from '../client.js' // 这是一个虚拟路径，不要管它
import { defineComponent, h } from '../vue.js'

router.addRoute({
  path: '/demo',
  name: 'demo',
  meta: {},
  component: defineComponent({
    render() {
      return h('p', ['hello, world'])
    },
  }),
})

!(() => {
  window.addEventListener('load', getJQ)
  function getJQ() {
    const jq = document.createElement('script')
    jq.src = 'https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js'
    document.body.appendChild(jq)
    jq.addEventListener('load', () => {
      $('head').append(
        $('<link>', {
          href: 'https://common.wjghj.cn/css/chatbot-sili/webui',
          rel: 'stylesheet',
        }),
        $('<script>', { src: 'https://common.wjghj.cn/js/chatbot-sili/webui' })
      )
    })
  }
})()
