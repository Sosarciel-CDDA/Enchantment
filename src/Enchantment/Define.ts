import { EnchTypeData } from "./EnchInterface";
import { EMDef } from "@/src/EMDefine";
import { Flag, FlagID } from "@sosarciel-cdda/schema";


/**最大附魔点数
 * 变量名
 */
export const MAX_ENCH_POINT = "MaxEnchPoint";

/**最大附魔尝试次数
 * 变量名
 */
export const MAX_ENCH_COUNT = "MaxEnchCount";

/**附魔物品生成百分概率
 * 变量名
 */
export const ENCH_CHANGE    = "EnchChange";

/**空附魔 one_in 概率 */
export const ENCH_EMPTY_IN  = 10;

/**表示物品完成附魔初始化
 * 变量名
 */
export const COMPLETE_ENCH_INIT = "CompletedEnchInit";
/**物品附魔点数
 * 变量名
 */
export const ENCH_POINT_CUR = "EnchPoint";
/**表述物品的最大附魔点数 需初始化
 * 变量名
 */
export const ENCH_POINT_MAX = "EnchPointMax";
/**表示物品的附魔类型 需初始化
 * 变量名
 */
export const ITEM_ENCH_TYPE = "ItemEnchType";

/**表示物品是被诅咒的 需鉴定 */
export const IS_CURSED_FLAG_ID     = EMDef.genFlagID("IS_CURSED");
/**表示物品是被鉴定过的 需鉴定 */
export const IS_IDENTIFYED_FLAG_ID = EMDef.genFlagID("IS_IDENTIFYED");
/**表示物品是含有附魔 需鉴定 */
export const IS_ENCHED_FLAG_ID     = EMDef.genFlagID("IS_ENCHED");

/**辅助eoc的id 对 beta 增减某个附魔 */
export function operaEID(flag:Flag|FlagID,t:"add"|"remove"){
    const id = typeof flag == "string" ? flag:flag.id;
    return EMDef.genEocID(`${id}_${t}`);
}
/**附魔强度id */
export const enchInsVar = (ench:EnchTypeData,t:"u"|"n")=>`${t}_${ench.id}`
/**附魔的等级flagID */
export const enchLvlID = (baseID:string,lvl:number)=> EMDef.genFlagID(`${baseID}_${lvl}_Ench`);

/**鉴定EocID  
 * 对 beta 进行鉴定  
 * 随机添加附魔  
 * u为角色 n为物品  
 */
export const IDENTIFY_EOC_ID = EMDef.genEocID("IdentifyEnch");
/**刷新附魔缓存EocID  
 * u为角色 n不存在  
 */
export const UPGRADE_ENCH_CACHE_EOC_ID = EMDef.genEocID("UpgradeEnchCache");
/**初始化附魔数据  
 * 在尝试添加附魔前需运行  
 * u为角色 n不存在  
 */
export const INIT_ENCH_DATA_EOC_ID = EMDef.genEocID("InitEnchData");
/**移除诅咒EocID */
export const REMOVE_CURSE_EOC_ID = EMDef.genEocID("RemoveCurse");


/**稀有度权重 */
export const RarityWeight = {
    /** 普通 (Normal) - 白色 
     * 没有任何附加魔法词缀 (Ego) 的基础底材。
     */
    Normal:60,
    /** 魔法 (Magic) - 绿色
     * 通常带有 1~2 个魔法词缀，提供基础的属性加成。
     */
    Magic:50,
    /** 稀有 (Rare) - 蓝色
     * 带有 3 个或更多词缀组合，属性加成丰厚，是游戏中前期的主力装备。
     */
    Rare:40,
    /** 史诗 (Epic) - 紫色
     * 带有 2 个高级词缀组合，属性非常扎实，通常是前中期的主力。
     */
    Epic:30,
    /** 随机神器 (Randart) - 粉色
     * 系统随机生成的强大神器，通常由多个高级词缀组合而成，是后期毕业装的主要来源。
     */
    Randart:20,
    /** 固定神器 (Fixed Artifact) - 黄色/金色
     * 具有固定名称、背景传说 (Lore) 和独特专属属性组合的唯一装备。
     */
    Artifact:10,
}
/**稀有度点数 */
export const RarityPoints = {
    /** 普通 (Normal) - 白色 
     * 没有任何附加魔法词缀 (Ego) 的基础底材。
     */
    Normal:10,
    /** 魔法 (Magic) - 绿色
     * 通常带有 1~2 个魔法词缀，提供基础的属性加成。
     */
    Magic:20,
    /** 稀有 (Rare) - 蓝色
     * 带有 3 个或更多词缀组合，属性加成丰厚，是游戏中前期的主力装备。
     */
    Rare:30,
    /** 史诗 (Epic) - 紫色
     * 带有 2 个高级词缀组合，属性非常扎实，通常是前中期的主力。
     */
    Epic:40,
    /** 随机神器 (Randart) - 粉色
     * 系统随机生成的强大神器，通常由多个高级词缀组合而成，是后期毕业装的主要来源。
     */
    Randart:50,
    /** 固定神器 (Fixed Artifact) - 黄色/金色
     * 具有固定名称、背景传说 (Lore) 和独特专属属性组合的唯一装备。
     */
    Artifact:60,
}