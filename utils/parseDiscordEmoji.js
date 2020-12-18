module.exports = msg => {
  msg = msg.replace(
    /<:.+?:(.+?)>/gi,
    '[CQ:image,file=https://discord-emoji.vercel.app/api/emojis/$1]'
  )
}
