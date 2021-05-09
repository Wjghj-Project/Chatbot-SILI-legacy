const { default: axios } = require('axios')
const { Context, segment, Time, Session } = require('koishi-core')
const { Logger, Tables } = require('koishi')
const logger = new Logger('bilibili')
logger.log = logger.info

const colName = 'bilibili-plus'

/**
 * @param {Context} ctx
 */
function apply(ctx) {
  ctx
    .command('bilibili.searchuser <username:string>')
    .shortcut(/^(?:查|找|查找)b站用户(.+)$/, { args: ['$1'] })
    .action(async ({ session }, username) => {
      if (!username) return
      const users = await findUsersByName(username)

      let uid
      if (users.length < 1) {
        return `没有找到名为 ${username} 的 bilibili 用户。`
      } else if (users.length > 1) {
        session.send(
          [
            '查询到了多个结果：',
            users
              .map((item, index) =>
                index < 10
                  ? `${index + 1}. ${item.uname} UID: ${item.mid}`
                  : null
              )
              .join('\n')
              .trim(),
            '请输入想查看的用户对应的编号。'
          ].join('\n')
        )
        let answer = await session.prompt(30 * 1000)
        answer = parseInt(answer)
        if (!answer || isNaN(answer) || answer > users.length || answer < 1) {
          return ''
        }
        uid = users[answer - 1].mid
      } else {
        uid = users[0].mid
      }

      const {
        mid,
        name,
        sex,
        face,
        sign,
        level,
        live_room
      } = await getUserById(uid)

      return (
        segment('quote', { id: session.messageId }) +
        [
          segment('image', { url: face }),
          `${name} https://space.bilibili.com/${mid}`,
          `等级：${level}级，性别：${sex}`,
          sign,
          live_room.roomStatus === 1
            ? `直播间：[${liveStatusName(live_room.liveStatus)}] ${
                live_room.title
              } ${live_room.url} (人气 ${live_room.online})`
            : null
        ].join('\n')
      )
    })

  ctx
    .command('bilibili.live', '直播间查询')
    .shortcut(/^b站直播间([0-9]+)$/i, { options: { room: '$1' } })
    .shortcut(/^查b站(.+)的直播间$/i, { options: { username: '$1' } })
    .option('room', '-r <id:posint> 通过直播间号查询')
    .option('uid', '-u <uid:posint> 通过主播 UID 查询')
    .option('username', '-U <name:string> 通过主播用户名查询')
    .action(async ({ session, options }) => {
      let uid
      if (options.room) {
        uid = await getUidByLiveid(options.room)
      } else if (options.uid) {
        uid = options.uid
      } else if (options.username) {
        const data = await getUidByName(options.username)
        if (!data) return `没有找到名为 ${options.username} 的 bilibili 用户。`
        uid = data
      } else {
        return session.execute('bilibili.live -h')
      }

      const {
        title,
        cover,
        url,
        roomNews,
        medalName,
        username,
        followerNum,
        liveStatus,
        liveTime,
        online
      } = await getLiveDetailsByUid(uid)

      return [
        segment('image', { url: cover }),
        title,
        url,
        roomNews.content ? roomNews.content : null,
        `主播：${
          medalName ? '[' + medalName + ']' : ''
        }${username} (${followerNum} 关注)`,
        `状态：${liveStatusName(liveStatus)} (${online} 人气)`,
        liveTime > 0
          ? `开播时间：${new Date(
              liveTime
            ).toLocaleString()} (${Time.formatTime(Date.now() - liveTime)})`
          : null
      ].join('\n')
    })

  ctx
    .command('bilibili.follow', '单推主播')
    .option('room', '-r <id:posint> 通过直播间号单推')
    .option('uid', '-u <uid:posint> 通过主播 UID 单推')
    .option('username', '-U <name:string> 通过主播用户名单推')
    .option('list', '-l 查看本群单推的主播')
    .option('remove', '-d, -R <uid:posint> 通过 UID 取消单推')
    .shortcut(/^单推b站主播(.+)$/i, { options: { username: '$1' } })
    .shortcut(/^单推列表$/, { options: { list: true } })
    .action(async ({ session, options }) => {
      // 获取单推列表
      if (options.list) {
        const users = await getFollowedBiliUps(session)
        if (users.length < 1) return '本群没有单推任何 bilibili 主播！'

        const userList = users
          .map((item, index) => {
            const lastTime = item.lastCall
              ? `(最近直播于 ${Time.formatTime(Date.now() - item.lastCall)} 前)`
              : '(未跟踪到直播信息)'
            const roomUrl = `https://space.bilibili.com/${item.b_roomid}`
            return `${index + 1}. ${item.b_username} (${
              item.b_uid
            })\n${roomUrl} ${lastTime}`
          })
          .join('\n')

        return [
          `本群一共单推了 ${users.length} 名 bilibili 主播！`,
          userList
        ].join('\n')
      }

      // 取消
      if (options.remove) {
        return removeFollowedBiliUps(session, options.remove)
      }

      let uid
      if (options.room) {
        uid = await getUidByLiveid(options.room)
      } else if (options.uid) {
        uid = options.uid
      } else if (options.username) {
        const data = await getUidByName(options.username)
        if (!data) return `没有找到名为 ${options.username} 的 bilibili 用户。`
        uid = data
      } else {
        return session.execute('bilibili.follow --list')
      }

      return addFollowedBiliUps(session, uid)
    })

  // 轮询
  async function loopTimmer() {
    const users = await ctx.database.get(colName, {})
    users.forEach((user) => {
      checkForBroadcast(ctx, user)
    })
    logger.info(
      new Date().toISOString(),
      '轮询',
      users.map((i) => i.b_uid)
    )
  }

  ctx.on('connect', () => {
    if (globalThis.biliPlusTimmer) return
    globalThis.biliPlusTimmer = true

    loopTimmer()
    // eslint-disable-next-line no-undef
    setInterval(loopTimmer, 60 * 1000)
  })

  // 扩展数据库
  Tables.extend(colName, { primary: '_id' })
}

async function findUsersByName(keyword) {
  const { data } = await axios.get(
    'https://api.bilibili.com/x/web-interface/search/type',
    {
      params: { keyword, search_type: 'bili_user' },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      }
    }
  )
  return data?.data?.result || []
}

async function getUidByName(name) {
  const users = await findUsersByName(name)
  if (users.lenth < 1) return null
  return users[0].mid
}

async function getUserById(mid) {
  const { data } = await axios.get(
    'https://api.bilibili.com/x/space/acc/info',
    {
      params: { mid },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      }
    }
  )
  if (data.code !== 0) throw data
  return data.data
}

async function getUidByLiveid(roomid) {
  return (await getLiveInit(roomid)).uid
}

function getUidFromUrl(url) {
  const reg = /(?:https?:)?\/\/space\.bilibili\.com\/([0-9]*).*/i
  const res = reg.exec(url)
  if (res && res[1]) return res[1]
  return null
}

async function getLiveInit(roomid) {
  const { data } = await axios.get(
    'https://api.live.bilibili.com/room/v1/Room/room_init',
    {
      params: { id: roomid },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      }
    }
  )
  return data?.data
}

async function getLiveMaster(uid) {
  const { data } = await axios.get(
    'https://api.live.bilibili.com/live_user/v1/Master/info',
    {
      params: { uid },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      }
    }
  )
  return data?.data
}

async function getLiveInfo(uid) {
  const { data } = await axios.get(
    'https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld',
    {
      params: { mid: uid },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
        Cookie: `LIVE_BUVID=${Math.random()}`
      }
    }
  )
  return data?.data
}

async function getLiveDetailsByUid(uid) {
  const [liveDetails, liveMaster] = await Promise.all([
    getLiveInfo(uid),
    getLiveMaster(uid)
  ])

  const {
    roomStatus,
    liveStatus,
    url,
    title,
    cover,
    online,
    roomid
  } = liveDetails
  const { medal_name, room_news, follower_num } = liveMaster
  const { uname: username } = liveMaster.info

  const { live_time } = await getLiveInit(roomid)
  return {
    uid,
    username,
    roomStatus,
    liveStatus,
    url,
    title,
    cover,
    online,
    roomid,
    medalName: medal_name,
    roomNews: room_news,
    followerNum: follower_num,
    liveTime: live_time * 1000
  }
}

function liveStatusName(status) {
  switch (status) {
    case 0:
      return '未开播'
    case 1:
      return '直播中'
    case 2:
      return '轮播中'
  }
}

/**
 * @param {Session} session
 */
async function getFollowedBiliUps(session) {
  const data = await session.database.get(colName, {
    channels: [`${session.platform}:${session.channelId}`]
  })

  return data
}

/**
 * @param {Session} session
 */
async function addFollowedBiliUps(session, uid) {
  const channel = `${session.platform}:${session.channelId}`
  let userData = await session.database.get(colName, {
    b_uid: [uid]
  })

  logger.info(userData)

  let user = userData[0] || {}

  const channels = user?.channels || []
  if (user?.channels?.includes(channel))
    return `您已经单推过 ${user.b_username} 了，居然不记得了吗，臭弟弟。`

  channels.push(channel)

  const { roomid, username, liveTime } = await getLiveDetailsByUid(uid)

  const updateData = {
    b_uid: uid,
    b_username: username,
    b_roomid: roomid,
    lastCall: liveTime,
    channels
  }

  if (userData.length < 1) {
    await session.database.create(colName, updateData)
  } else {
    await session.database.update(colName, [{ ...updateData, _id: user._id }])
  }

  return `单推成功：${username} (直播间 ${roomid})`
}

/**
 * @param {Session} session
 */
async function removeFollowedBiliUps(session, uid) {
  const channel = `${session.platform}:${session.channelId}`
  let userData = await session.database.get(colName, {
    b_uid: [uid]
  })

  logger.info(userData)
  if (userData.length < 1) return '找不到主播数据。'

  const user = userData[0]

  const channels = user?.channels || []
  if (channels.includes(channel)) {
    channels.splice(channel.indexOf(channels), 1)
  } else {
    return `你根本就没关注过 ${user.b_username}，臭弟弟！`
  }

  if (channels.length < 1) {
    await session.database.remove(colName, [user._id])
    logger.info('无频道关注，移除记录', uid)
  } else {
    await session.database.update(colName, [{ channels, _id: user._id }])
  }

  return `取关成功：${user.b_username} (直播间 ${user.b_roomid})，再见吧臭弟弟，你肯定喜欢上别的主播了。`
}

async function checkForBroadcast(ctx, user) {
  const { b_uid, lastCall } = user
  const { liveTime } = await getLiveDetailsByUid(b_uid)
  if (liveTime !== lastCall) {
    broadcast(ctx, user)
  } else {
    logger.info(new Date().toISOString(), '未开播/已广播', b_uid)
  }
}

/**
 * @param {Context} ctx
 * @param {Session} session
 */
async function broadcast(ctx, user) {
  const { _id, b_uid, channels } = user
  const {
    title,
    roomid,
    url,
    roomNews,
    medalName,
    username,
    followerNum,
    liveStatus,
    liveTime,
    online
  } = await getLiveDetailsByUid(b_uid)
  await ctx.broadcast(
    channels,
    [
      `您单推的主播${
        liveStatus === 1 ? '开播啦！' : '已下播，记得下次再来哦！'
      }`,
      title,
      url,
      roomNews.content ? roomNews.content : null,
      `主播：${
        medalName ? '[' + medalName + ']' : ''
      }${username} (${followerNum} 关注)`,
      `状态：${liveStatusName(liveStatus)} (${online} 人气)`,
      liveTime > 0
        ? `开播时间：${new Date(liveTime).toLocaleString()} (${Time.formatTime(
            Date.now() - liveTime
          )})`
        : null
    ].join('\n')
  )
  await ctx.database.update(
    colName,
    [{ _id, lastCall: liveTime, b_username: username, b_roomid: roomid }],
    '_id'
  )
  logger.info(
    new Date().toISOString(),
    liveStatus === 1 ? '开播广播' : '下播广播',
    b_uid
  )
}

module.exports = {
  name: colName,
  apply
}
