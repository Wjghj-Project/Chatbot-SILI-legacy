const axios = require('axios')
const { JSDOM } = require('jsdom')
const jquery = require('jquery')

function fandomCommunitySearch(search = '', lang = 'en', next) {

  console.log('Search Fandom wiki:', search + ' | Lang: ' + lang)

  // GET 网页内容
  axios.get('https://community-search.fandom.com/wiki/Special:Search', {
    params: {
      search: search,
      resultsLang: lang,
      uselang: 'zh'
    }
  }).then(res => {
    console.log('Wiki found')

    // 创建 jQuery 对象
    var html = res.data
    var { window } = new JSDOM(html)
    var $ = jquery(window)

    var searchText = search
    var searchTitle = $('.page-header__title').text()
    var total = $('.result-count').text()
    total = total.replace(/[^0-9]/ig, '') // 提取数字
    var wikis = []
    $.each($('.result-description'), (id, dom) => {
      var $this = $(dom)
      wikis.push({
        name: $this.find('.result-link').text(),
        url: $this.find('.result-link').attr('href'),
        hub: $this.find('.hub').text(),
        description: $this.find('.description').text(),
        pages: $this.find('.wiki-statistics > li:first').text()
      })
    })
    var res = {
      status: true,
      total,
      searchText,
      searchTitle,
      wikis
    }
    next && next(res)
  }).catch(error => {
    console.error(error)
    next && next({
      status: false,
      error
    })
  })
}

module.exports = {
  fandomCommunitySearch
}