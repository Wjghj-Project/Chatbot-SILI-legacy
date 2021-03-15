"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
exports.apply = exports.name = void 0;
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var koishi_core_1 = require("koishi-core");
exports.name = 'baidu';
var URL_BASE = 'https://baike.baidu.com';
var URL_SEARCH = URL_BASE + '/search?word=';
koishi_core_1.template.set('baidu', {
    'article-not-exist': '百度百科尚未收录词条 “{0}” 。',
    'await-choose-result': '请发送您想查看的词条编号。',
    'error-with-link': '百度搜索时出现问题。',
    'has-multi-result': '“{0}”有多个搜索结果（显示前 {1} 个）：',
    'incorrect-index': ''
});
/** 从搜索列表中获取指定顺位结果的词条链接 */
function getArticleLink($, index) {
    var $list = $('.search-list dd');
    // 处理 index
    if (index < 0)
        index = 0;
    if ($list.length < 1 || index + 1 > $list.length)
        return;
    // 获取词条链接
    var $entry = $list.eq(index);
    var url = $entry.find('a.result-title').attr('href');
    if (!url)
        return;
    if (/^\/item\//.test(url)) {
        url = URL_BASE + url;
    }
    return url;
}
/** 从搜索列表中获取指定顺位结果的词条内容 */
function getHtml(url) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!url)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, axios_1["default"].get(url)];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, cheerio_1.load(data)];
            }
        });
    });
}
function formatAnswer($, link, options) {
    $('.lemma-summary sup').remove(); // 删掉 [1] 这种鬼玩意
    var summary = $('.lemma-summary').text().trim(); // 获取词条的第一段
    if (summary.length > options.maxSummaryLength) {
        summary = summary.slice(0, options.maxSummaryLength) + '...';
    }
    return koishi_core_1.interpolate(options.format, {
        title: $('h1').text().trim(),
        thumbnail: koishi_core_1.segment.image($('.summary-pic img').attr('src')),
        tips: $('.view-tip-panel').text().trim(),
        summary: summary,
        link: link
    }).replace(/\n+/g, '\n');
}
function apply(ctx, options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    options = __assign({ maxResultCount: 3, maxSummaryLength: 200, format: '{{ thumbnail }}\n{{ title }}\n{{ tips }}\n{{ summary }}\n来自：{{ link }}' }, options);
    ctx.command('tools/baidu <keyword>', '使用百度百科搜索')
        .example('百度一下最终幻想14')
        .shortcut('百度一下', { fuzzy: true, greedy: true })
        .shortcut('百度', { fuzzy: true, greedy: true })
        .action(function (_a, keyword) {
        var session = _a.session;
        return __awaiter(_this, void 0, void 0, function () {
            var url, $, index, $results, count, output, i, $item, title, desc, answer, articleLink, $article, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!keyword)
                            return [2 /*return*/, session.execute('baidu -h')];
                        url = URL_SEARCH + encodeURI(keyword);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, getHtml(url)
                            // 没有相关词条
                        ];
                    case 2:
                        $ = _b.sent();
                        // 没有相关词条
                        if ($('.create-entrance').length || $('.no-result').length) {
                            return [2 /*return*/, koishi_core_1.template('baidu.article-not-exist', keyword, url)];
                        }
                        index = 0;
                        $results = $('.search-list dd');
                        count = Math.min($results.length, options.maxResultCount);
                        if (!(count > 1)) return [3 /*break*/, 5];
                        output = [koishi_core_1.template('baidu.has-multi-result', keyword, count)];
                        for (i = 0; i < count; i++) {
                            $item = $results.eq(i);
                            title = $item.find('.result-title').text().replace(/[_\-]\s*百度百科\s*$/, '').trim();
                            desc = $item.find('.result-summary').text().trim();
                            output.push(i + 1 + ". " + title + "\n  " + desc);
                        }
                        output.push(koishi_core_1.template('baidu.await-choose-result', count));
                        return [4 /*yield*/, session.send(output.join('\n'))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, session.prompt(30 * 1000)];
                    case 4:
                        answer = _b.sent();
                        if (!answer)
                            return [2 /*return*/];
                        index = +answer - 1;
                        if (!koishi_core_1.isInteger(index) || index < 0 || index >= count) {
                            return [2 /*return*/, koishi_core_1.template('baidu.incorrect-index')];
                        }
                        _b.label = 5;
                    case 5:
                        articleLink = getArticleLink($, index);
                        return [4 /*yield*/, getHtml(articleLink)];
                    case 6:
                        $article = _b.sent();
                        if (!$article) {
                            return [2 /*return*/, koishi_core_1.template('baidu.error-with-link', url)];
                        }
                        // 获取格式化文本
                        return [2 /*return*/, formatAnswer($article, articleLink, options)];
                    case 7:
                        err_1 = _b.sent();
                        ctx.logger('baidu').warn(err_1);
                        return [2 /*return*/, koishi_core_1.template('baidu.error-with-link', url)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    });
}
exports.apply = apply;
