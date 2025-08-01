import {getGenerateRecipe} from "../../api/ai.js";

Page({
  data: {
    recipe: null
  },
  onLoad(options) {
    let recipe = null;
    let data = JSON.parse(decodeURIComponent(options.data));
    console.log("result data:",data)
    if (data) {
      try {
        getGenerateRecipe(options.data).then(res=>{
          recipe = res.data
          console.log("recipe",recipe)
          this.setData({ recipe });
        })
      } catch (e) {
        recipe = null;
      }
    }
    
  }
}); 