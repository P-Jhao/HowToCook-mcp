import { z } from "zod";
import { Recipe } from "../types/index.js";
import { simplifyRecipeNameOnly } from "../utils/recipeUtils.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetAllRecipesTool(server: McpServer, recipes: Recipe[]) {
  server.tool(
    "getAllRecipes",
    "获取所有菜谱列表。返回所有菜谱的名称和简介，适合浏览或搜索菜谱。注意：返回数据量较大，建议优先使用 getRecipesByCategory 按分类查询。",
    {},
    async () => {
      // 返回简化版的菜谱数据，只包含 name 和 description
      const simplifiedRecipes = recipes.map(simplifyRecipeNameOnly);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(simplifiedRecipes, null, 2),
          },
        ],
      };
    }
  );
}
