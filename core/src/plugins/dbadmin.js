const { Argv } = require('koishi-core')
const { segment } = require('koishi-utils')
const resoveBrackets = require('../utils/resolveBrackets')

Argv.createDomain('object', (item) => JSON.parse(item))

/**
 * @param {import('koishi-core').Context} ctx
 */
function apply(ctx) {
  ctx
    .command(
      'admin/dbadmin <col:string> <action:string> <filter:text>',
      '数据库管理',
      {
        authority: 4,
      }
    )
    .example(`查找 dbadmin channel findOne { "pid": "12345" }`)
    .example(
      `更新 dbadmin channel updateOne { "pid": "12345" } |-| { "foo": "bar" }`
    )
    .check((_, col, action, filter) => {
      if (!col || !action || !filter) return '缺少必要参数。'
    })
    .check((_, col, action) => {
      if (!['find', 'findOne', 'update', 'updateOne'].includes(action))
        return `不可用的操作: ${action}`
    })
    .action(async (_, col, action, filter) => {
      let dbFilter = filter
        .split('|-|')
        .map((item) => (item ? JSON.parse(resoveBrackets(item)) : {}))

      switch (action.toLowerCase()) {
        case 'find':
        case 'findne': {
          if (dbFilter.length < 2) {
            dbFilter.push({ _id: -1, id: 1, name: 1, authority: 1 })
          }
          console.log(dbFilter)
          return ctx.database.mongo.db
            .collection(col)
            .find(dbFilter[0])
            .project(dbFilter[1])
            .limit(1)
            .toArray()
            .then((data) => JSON.stringify(data[0], null, 2))
        }
        case 'update':
        case 'updateone': {
          return new Promise((resolve, reject) => {
            if (dbFilter.length < 2) {
              return reject('缺少所更新的内容。')
            }
            const dbFinal = [
              ...dbFilter,
              (err, data) => {
                if (err) {
                  return reject(err)
                }
                resolve(JSON.stringify(data, null, 2))
              },
            ]
            ctx.database.mongo.db.collection(col).updateOne(...dbFinal)
          })
        }
      }
    })
}

module.exports = {
  name: 'database-admin',
  apply,
}
