# Wjghj QQbot Koishi

万界规划局 QQ 机器人，主要用于处理 Fandom 官方 QQ 群 → Discord 的消息推送，也附带一些为了作者为了自己方便写的指令。

## Fandom 中文社区中心

- QQ 群: https://community.fandom.com/zh/index.php?curid=3399
- Discord: https://discord.gg/kK5Ttan

由于服务器在国内，无法直连 Discord 的 API，因此目前只有 QQ 群 → Discord 的单边推送功能。~~互联功能有在考虑，但是没钱买服务器。~~

## Fandom 相关指令

可以通过 `@XiaoYuJunBot <command>` `sili，<command>` 或者 `!<command>` 触发。

### `[[link]]`

**本指令仅在 Fandom 编辑者讨论群生效**

通过 Fandom 英文社区中心的 API 返回一个 Fandom wiki 的页面链接。

例如 `[[Help:Content]]` → https://community.fandom.com/wiki/Help:Content

Fandom 的全域跨语言链接同样适用，例如 `[[w:c:zh.ngnl:初濑伊纲]]` → https://ngnl.fandom.com/zh/wiki/%E5%88%9D%E6%BF%91%E4%BC%8A%E7%BA%B2

### `fandom-community-search`

通过小鱼君编写的~~废物~~爬虫爬取 https://community-search.fandom.com 的数据，返回指定关键词的搜索结果。

`!fandom-community-search <关键词> -lang [语言代码] -nth [第几个结果]`

- **关键词** 就是搜索的关键词，如果有空格则需要用引号包裹起来，例如`"Minecraft Wiki`
- **语言代码** 预设搜索英文`en`，中文为`zh`，语言代码与 MediaWiki 软件设定一致
- **第几个结果** 预设显示第一个结果，必须是 1-10 的数字，否则显示第一个

范例：`!fms 游戏人生 -l zh`

### `fandom-help-center`

懒人专用插件，返回帮助中心的链接。

**仅在 Fandom 编辑者讨论群生效** 关键词 `帮助中心` 会触发此指令

### `fandom-zendesk`

懒人专用插件，返回 Fandom 客服的链接。

**仅在 Fandom 编辑者讨论群生效** 关键词 `联系官方` 会触发此指令

## InPageEdit 相关指令

通过 Wjghj API 查询 [InPageEdit Analysis](https://dragon-fish.github.io/inpageedit-v2/analysis/) 的统计数据。

### `inpageedit-search`

通过 Wiki 名称查询 InPageEdit 的使用情况，如果查询结果大于 3，只显示前三个。

`inpageedit-search <sitename>`

- **sitename** Wiki 的名称，取`wgSiteName`，

范例：`!ipes 萌娘百科`

## 一些小玩意

### ~~她好可爱，一拳打下去一定会哭吧~~


如果你的发言触发特定的条件，例如骂她“人工智障”，她会予以回应。

```
> sili就是人工智障！
< ?你说谁是人工智障呢¿
```
