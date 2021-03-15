"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
// const axios = require('axios').default
// const cheerio = require('cheerio')
// const { segment } = require('koishi-utils')
var axios_1 = require("axios");
var cheerio = require("cheerio");
var koishi_core_1 = require("koishi-core");
/**
 * @name koishi-plugin-baidu 百度百科插件
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @license Apache-2.0
 */
module.exports.name = 'plugin-baidu';
/**
 * @function _msg
 * @param {String} msgKey
 * @param  {...String} args
 * @return {String}
 */
function _msg(msgKey) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    function handleArgs(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.forEach(function (elem, index) {
            var rgx = new RegExp('\\$' + (index + 1), 'g');
            message = message.replace(rgx, elem);
        });
        return message;
    }
    var allMsg = {
        article_not_exist: '喵，百度百科尚未收录词条 “$1” 。\n您可以访问以确认：$2',
        baikeArticle: 'https://baike.baidu.com/item/$1',
        baikeSearch: 'https://baike.baidu.com/search?word=$1',
        basicSearch: 'https://www.baidu.com/s?wd=$1',
        error_with_link: '百度搜索时出现问题。\n您可以访问以确认：$1'
    };
    if (allMsg[msgKey]) {
        var finalMsg = handleArgs.apply(void 0, __spreadArrays([allMsg[msgKey]], args));
        return finalMsg;
    }
    else {
        var showArgs = '';
        if (args.length > 0) {
            showArgs += ': ' + args.join(', ');
        }
        return "<" + module.exports.name + "-" + msgKey + showArgs + ">";
    }
}
/**
 * @function makeSearch 获取搜索列表
 * @param {String} keyword 搜索关键词
 * @return {Promise}
 */
function makeSearch(keyword) {
    return __awaiter(this, void 0, Promise, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1["default"].get(_msg('baikeSearch', encodeURI(keyword)))];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, cheerio.load(data)];
            }
        });
    });
}
/**
 * @function getArticleLink 从搜索列表中获取指定顺位结果的词条链接
 * @param {Cheerio} $search 搜索列表的cheerio对象
 * @param {Number} index
 * @return {String} 词条的链接
 */
function getArticleLink($search, index) {
    if (index === void 0) { index = 0; }
    var $list = $search('.search-list dd');
    // 处理 index
    if (index < 0)
        index = 0;
    if ($list.length < 1 || index + 1 > $list.length)
        return null;
    // 获取词条链接
    var $entry = $list.eq(index);
    var url = $entry.find('a.result-title').attr('href');
    if (!url)
        return null;
    if (/^\/item\//.test(url))
        url = _msg('baikeArticle', url.replace('/item/', ''));
    return url;
}
/**
 * @function getArticle 从搜索列表中获取指定顺位结果的词条内容
 * @param {Cheerio} $search 搜索列表的cheerio对象
 * @param {Number} index
 * @return {Promise}
 */
function getArticle($search, index) {
    if (index === void 0) { index = 0; }
    return __awaiter(this, void 0, Promise, function () {
        var url, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = getArticleLink($search, index);
                    if (!url)
                        return [2 /*return*/, null
                            // 获取词条内容
                        ];
                    return [4 /*yield*/, axios_1["default"].get(url)];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, cheerio.load(data)];
            }
        });
    });
}
/**
 * @function formatAnswer
 * @param {Cheerio} $article 词条页面的cheerio对象
 * @param {String} from 来源url
 * @return {String}
 */
function formatAnswer(_a) {
    var $article = _a.$article, from = _a.from, pOptions = _a.pOptions;
    var msg = [];
    // 获取简图
    var summaryPic = $article('.summary-pic img');
    if (summaryPic.length > 0 && pOptions.showImage) {
        msg.push(koishi_core_1.segment('image', {
            file: summaryPic.attr('src')
        }));
    }
    // 获取词条标题
    var title = $article('h1')
        .text()
        .trim();
    msg.push(title);
    // 获取类似“同义词”的提示
    var tip = $article('.view-tip-panel');
    if (tip.length > 0) {
        tip = tip.text().trim();
        msg.push(tip);
    }
    // 获取词条的第一段
    $article('.lemma-summary sup').remove(); // 删掉 [1] 这种鬼玩意
    var summary = $article('.lemma-summary')
        .text()
        .trim();
    var maxLength = summary.length;
    if (pOptions.maxSummaryLength > 0) {
        maxLength = pOptions.maxSummaryLength;
    }
    msg.push(summary.length > maxLength
        ? summary.substr(0, maxLength) + ' [...]'
        : summary);
    msg.push("\u6765\u81EA\uFF1A" + from);
    return msg.join('\n');
}
module.exports.apply = function (koishi, userOptions) {
    if (userOptions === void 0) { userOptions = {}; }
    var defaultOptions = {
        maxSummaryLength: 220,
        sendError: true,
        showImage: true
    };
    var pOptions = Object.assign({}, defaultOptions, userOptions);
    koishi
        .command('baidu <keyword>', '使用百度百科搜索')
        .example('baidu 最终幻想14')
        .action(function (_a, keyword) {
        var session = _a.session;
        return __awaiter(void 0, void 0, void 0, function () {
            var $search, $article, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // 是否有关键词
                        if (!keyword)
                            return [2 /*return*/, session.execute('baidu -h')];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, makeSearch(keyword)
                            // console.log('搜索完成')
                            // 没有相关词条
                        ];
                    case 2:
                        $search = _b.sent();
                        // console.log('搜索完成')
                        // 没有相关词条
                        if ($search('.create-entrance').length > 0 || $search('.no-result')) {
                            return [2 /*return*/, _msg('article_not_exist', keyword, _msg('baikeSearch', encodeURI(keyword)))];
                        }
                        return [4 /*yield*/, getArticle($search, 0)
                            // console.log('已取得词条内容')
                        ];
                    case 3:
                        $article = _b.sent();
                        // console.log('已取得词条内容')
                        if (!$article) {
                            console.log('$article出现问题');
                            return [2 /*return*/, pOptions.sendError
                                    ? _msg('error_with_link', _msg('baikeSearch', encodeURI(keyword)))
                                    : ''];
                        }
                        // 获取格式化文本
                        return [2 /*return*/, formatAnswer({
                                $article: $article,
                                from: getArticleLink($search, 0),
                                pOptions: pOptions
                            })];
                    case 4:
                        err_1 = _b.sent();
                        // console.error('百度搜索时出现问题', err)
                        return [2 /*return*/, pOptions.sendError
                                ? _msg('error_with_link', _msg('baikeSearch', encodeURI(keyword)))
                                : ''];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
};
