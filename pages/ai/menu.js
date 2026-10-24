Page({
  data: {
    ingredientsInput: '',
    preferencesInput: '',
    excludesInput: '',
    errorMsg: ''
  },
  onIngredientsInput(e) {
    this.setData({ ingredientsInput: e.detail.value });
  },
  onPreferencesInput(e) {
    this.setData({ preferencesInput: e.detail.value });
  },
  onExcludesInput(e) {
    this.setData({ excludesInput: e.detail.value });
  },
  generateMenu() {
    const ingredients = this.data.ingredientsInput.split(',').map(s => s.trim()).filter(Boolean);
    const preferences = this.data.preferencesInput.split(',').map(s => s.trim()).filter(Boolean);
    const excludes = this.data.excludesInput.split(',').map(s => s.trim()).filter(Boolean);

    if (!ingredients.length) {
      this.setData({ errorMsg: '请至少输入一个食材' });
      return;
    }

    // 先收起键盘：避免点击时输入框失焦、键盘回落导致页面回弹跳动
    wx.hideKeyboard();
    // 立即发出跳转：让结果页动画立即接管，绝不等待任何异步
    wx.navigateTo({
      url: '/pages/ai/result?data=' + encodeURIComponent(JSON.stringify({ ingredients, preferences, excludes }))
    });
    // 跳转后再补震动反馈，强化“已点击”的即时感，且不会阻塞跳转
    wx.vibrateShort({ type: 'light' });
  }
});
