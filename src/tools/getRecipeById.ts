import { z } from "zod";
import { Recipe } from "../types/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetRecipeByIdTool(server: McpServer, recipes: Recipe[]) {
  server.tool(
    "getRecipeById",
    "根据菜谱名称查询详细信息。返回菜谱的完整详情，包括食材清单、烹饪步骤、技巧等。支持模糊匹配菜名。",
    {
      name: z.string().describe('菜谱名称，如"红烧肉"、"番茄炒蛋"等，支持模糊匹配')
    },
    async ({ name }: { name: string }) => {
      // 首先尝试精确匹配名称
      let foundRecipe = recipes.find(recipe => recipe.name === name);
      
      // 如果没有找到，尝试模糊匹配名称
      if (!foundRecipe) {
        foundRecipe = recipes.find(recipe => 
          recipe.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      
      // 如果仍然没有找到，返回所有可能的匹配项（最多5个）
      if (!foundRecipe) {
        const possibleMatches = recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(name.toLowerCase()) ||
          recipe.description.toLowerCase().includes(name.toLowerCase())
        ).slice(0, 5);
        
        if (possibleMatches.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `未找到名称包含"${name}"的菜谱`,
                  suggestion: "请检查菜谱名称是否正确，或尝试使用其他关键词"
                }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: `未找到"${name}"的精确匹配，以下是可能相关的菜谱：`,
                possibleMatches: possibleMatches.map(recipe => ({
                  name: recipe.name,
                  description: recipe.description,
                  category: recipe.category
                }))
              }, null, 2),
            },
          ],
        };
      }
      
      // 返回找到的完整菜谱信息
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(foundRecipe, null, 2),
          },
        ],
      };
    }
  );
}
