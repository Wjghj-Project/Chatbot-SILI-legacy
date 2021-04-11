#!/usr/bin/node

const { default: axios } = require('axios')

async function getLatest(name) {
  const { data } = axios.get(`https://registry.npmjs.org/${name}`)
  return data?.['dist-tags']?.latest
}

module.exports = async () => {
  const packageInfo = require('../package.json')
  const { dependencies } = packageInfo
  let koishiPlugs = []
  Object.keys(dependencies).forEach(name => {
    if (name.startsWith('koishi'))
      koishiPlugs.push([name, dependencies[name].replace('^', '')])
  })

  let payloads = []
  koishiPlugs.forEach(async ([name]) => {
    payloads.push()
  })
  Promise.all()
}
