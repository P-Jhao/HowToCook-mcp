import { z } from "zod";
import { Recipe } from "../types/index.js";
import { simplifyRecipe } from "../utils/recipeUtils.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetRecipesByCategoryTool(server: McpServer, recipes: Recipe[], categories: string[]) {
  server.tool(
    "getRecipesByCategory",
    `按分类查询菜谱。可用分类：${categories.join('、')}。返回该分类下所有菜谱的基本信息。`,
    {
      category: z.string().describe(`菜谱分类名称，可选值：${categories.join('、')}`)
    },
    async ({ category }: { category: string }) => {
      const filteredRecipes = recipes.filter((recipe) => recipe.category === category);
      
      if (filteredRecipes.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `未找到分类"${category}"的菜谱`,
                availableCategories: categories,
                suggestion: "请使用上述可用分类之一"
              }, null, 2),
            },
          ],
        };
      }
      
      // 返回简化版的菜谱数据
      const simplifiedRecipes = filteredRecipes.map(simplifyRecipe);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              category,
              count: simplifiedRecipes.length,
              recipes: simplifiedRecipes
            }, null, 2),
          },
        ],
      };
    }
  );
}
