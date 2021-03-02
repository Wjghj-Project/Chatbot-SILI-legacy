<div align="center">

<img src="https://i.loli.net/2021/02/19/nPzM8qvmyGBI2aL.jpg" alt="SILI t2020 avatar.jpg" title="SILI t2020 avatar.jpg" width="200"/>

# Wjghj Chatbot SILI

</div>

万界规划局聊天机器人，主要用于处理 Fandom 官方 QQ 群 ↔ Discord 的消息推送，也附带一些好玩的功能。

名字 SILI，来自作者的原创角色 [苏凛栎](https://epbureau.fandom.com/wiki/苏凛栎)，是一个人工智能小萝莉、一个笨蛋。

## Fandom 中文社区中心

- QQ 群: https://community.fandom.com/zh/index.php?curid=3399
- Discord: https://discord.gg/kK5Ttan

能够实现 QQ 群 ↔ Discord 的双向消息推送。

## 常用指令

可以通过 `@SILI <command>` `sili，<command>` 或者 `!<command>` 触发。

全部指令以及使用说明可以通过`!help -a`获取。

### `wiki <pagename>`

通过配置好的 MediaWiki API 返回一个 wiki 的页面信息与链接。

例如 `[[Help:Content]]` → https://community.fandom.com/zh/wiki/Help:Content

Fandom 的全域跨语言链接同样适用，例如 `[[w:c:zh.ngnl:初濑伊纲]]` → https://ngnl.fandom.com/zh/wiki/%E5%88%9D%E6%BF%91%E4%BC%8A%E7%BA%B2

### `genshin`

查询《原神》国服玩家信息。

- `genshin.5star` 展示你的 5 型星色
- `genshin.abyss` 查看深境螺旋通关情况。

### `fandom-community-search`

通过小鱼君编写的~~废物~~爬虫爬取 https://community-search.fandom.com 的数据，返回指定关键词的搜索结果。

`!fandom-community-search <关键词> --lang [语言代码] --nth [第几个结果]`

- **关键词** 就是搜索的关键词，如果有空格则需要用引号包裹起来，例如`"Minecraft Wiki`
- **语言代码** 预设搜索中文`zh`，语言代码与 MediaWiki 软件设定一致
- **第几个结果** 预设显示第一个结果，必须是 1-10 的数字，否则显示第一个

范例：`!fms 游戏人生 -l zh`

### `inpageedit-search [sitename]`

通过 Wjghj API 查询 [InPageEdit Analysis](https://blog.wjghj.cn/inpageedit-v2/analysis/) 的统计数据。

通过 Wiki 名称查询 InPageEdit 的使用情况，如果查询结果大于 3，只显示前三个。

- **sitename** Wiki 的名称，取`wgSiteName`，

范例：`!ipes 萌娘百科`

## 一些小玩意

### ~~她这么可爱，打一拳一定会哭很久吧~~

如果你的发言触发特定的条件，例如骂她“人工智障”，她会予以回应。

```
> sili就是人工智障！
< ¿你说谁是人工智障呢?
```
