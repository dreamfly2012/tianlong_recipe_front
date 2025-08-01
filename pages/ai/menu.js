Page({
  data: {
    ingredientsInput: '',
    preferencesInput: '',
    excludesInput: '',
    recipe: null,
    errorMsg: '',
    loading: false
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
      this.setData({ errorMsg: '请至少输入一个食材', recipe: null });
      return;
    }
   
    wx.navigateTo({
      url: '/pages/ai/result?data='+JSON.stringify({ ingredients, preferences, excludes })
    })

    
  }
});
