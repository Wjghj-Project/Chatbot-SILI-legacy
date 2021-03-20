module.exports = msg => {
  msg = msg.replace(
    /\[CQ:face,id=(.+?),.+\]/gi,
    '[CQ:image,file=https://discord-emoji.vercel.app/api/emojis/$1]'
  )
  return msg
}
