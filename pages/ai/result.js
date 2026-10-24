import { getGenerateRecipe } from "../../api/ai.js";
const { normalizeRecipe } = require("../../utils/image");

// 加载时循环展示的可爱文案
const LOADING_TEXTS = [
  '👨‍🍳 厨师正在思考中',
  '🥕 正在挑选新鲜食材',
  '🍳 正在调配完美火候',
  '📖 正在撰写专属菜谱',
  '🧑‍🍳 大厨正在颠勺啦',
  '✨ 灵感马上就好啦'
];

Page({
  data: {
    recipe: null,
    loading: true,
    error: '',
    loadingText: LOADING_TEXTS[0]
  },

  onLoad(options) {
    let payload = null;
    try {
      payload = JSON.parse(decodeURIComponent(options.data));
    } catch (e) {
      payload = null;
    }

    if (!payload) {
      this.setData({ loading: false, error: '参数错误，请重新尝试' });
      return;
    }

    // 启动可爱加载文案轮播
    this._textIndex = 0;
    this._textTimer = setInterval(() => {
      this._textIndex = (this._textIndex + 1) % LOADING_TEXTS.length;
      this.setData({ loadingText: LOADING_TEXTS[this._textIndex] });
    }, 1800);

    // 兜底守卫：即便请求既没成功也没失败（极端情况），也不让动画无限转圈
    this._guardTimer = setTimeout(() => {
      if (this.data.loading) {
        this.stopLoadingAnim();
        this.setData({ loading: false, error: '请求超时，请检查网络后重试' });
      }
    }, 61000);

    // 传入解析后的对象（修复：此前误将 JSON 字符串作为请求体）
    getGenerateRecipe(payload)
      .then(res => {
        this.clearGuard();
        this.stopLoadingAnim();
        if (res && res.data) {
          this.setData({ recipe: normalizeRecipe(res.data), loading: false });
        } else {
          this.setData({ loading: false, error: (res && res.msg) || '菜谱获取失败，请稍后重试' });
        }
      })
      .catch(err => {
        this.clearGuard();
        this.stopLoadingAnim();
        const msg = (err && err.message) || '菜谱获取失败，请稍后重试';
        this.setData({ loading: false, error: msg });
      });
  },

  // 停止加载文案轮播，避免内存泄漏
  stopLoadingAnim() {
    if (this._textTimer) {
      clearInterval(this._textTimer);
      this._textTimer = null;
    }
  },

  // 清除兜底守卫定时器
  clearGuard() {
    if (this._guardTimer) {
      clearTimeout(this._guardTimer);
      this._guardTimer = null;
    }
  },

  onUnload() {
    this.stopLoadingAnim();
    this.clearGuard();
  }
});

