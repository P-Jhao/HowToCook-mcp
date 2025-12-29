import { z } from "zod";
import { Recipe, DishRecommendation } from "../types/index.js";
import { simplifyRecipe } from "../utils/recipeUtils.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerWhatToEatTool(server: McpServer, recipes: Recipe[]) {
  server.tool(
    "whatToEat",
    "今天吃什么？根据用餐人数随机推荐一顿饭的菜品组合，包含荤素搭配。适合不知道吃什么时使用。",
    {
      peopleCount: z.number().int().min(1).max(10)
                   .describe('用餐人数（1-10人），会根据人数推荐合适数量的菜品')
    },
    async ({ peopleCount }: { peopleCount: number }) => {
      // 根据人数计算菜品数量：1-2人推荐2-3个菜，3-4人推荐3-4个菜，以此类推
      const totalDishes = Math.max(2, Math.ceil(peopleCount * 0.8) + 1);
      const meatCount = Math.ceil(totalDishes / 2);
      const vegetableCount = totalDishes - meatCount;
      
      // 获取荤菜（荤菜 + 水产）
      let meatDishes = recipes.filter((recipe) => 
        recipe.category === '荤菜' || recipe.category === '水产'
      );
      
      // 获取素菜
      let vegetableDishes = recipes.filter((recipe) => 
        recipe.category === '素菜'
      );
      
      // 如果素菜不够，加入汤和甜品作为补充
      if (vegetableDishes.length < vegetableCount) {
        const extraDishes = recipes.filter((recipe) => 
          recipe.category === '汤' || recipe.category === '甜品'
        );
        vegetableDishes = vegetableDishes.concat(extraDishes);
      }
      
      const selectedMeatDishes: Recipe[] = [];
      const selectedVegetableDishes: Recipe[] = [];
      
      // 随机选择荤菜
      const shuffledMeat = [...meatDishes].sort(() => Math.random() - 0.5);
      for (let i = 0; i < meatCount && i < shuffledMeat.length; i++) {
        selectedMeatDishes.push(shuffledMeat[i]);
      }
      
      // 随机选择素菜
      const shuffledVeg = [...vegetableDishes].sort(() => Math.random() - 0.5);
      for (let i = 0; i < vegetableCount && i < shuffledVeg.length; i++) {
        selectedVegetableDishes.push(shuffledVeg[i]);
      }
      
      // 合并推荐菜单
      const recommendedDishes = [...selectedMeatDishes, ...selectedVegetableDishes];
      
      const recommendationDetails: DishRecommendation = {
        peopleCount,
        meatDishCount: selectedMeatDishes.length,
        vegetableDishCount: selectedVegetableDishes.length,
        dishes: recommendedDishes.map(simplifyRecipe),
        message: `为${peopleCount}人推荐${recommendedDishes.length}道菜：${selectedMeatDishes.length}荤${selectedVegetableDishes.length}素`
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(recommendationDetails, null, 2),
          },
        ],
      };
    }
  );
}
