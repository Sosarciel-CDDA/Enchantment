import { EMDef } from "@/src/EMDefine";
import { Flag, FlagID } from "@sosarciel-cdda/schema";
import { EnchEffect } from "./EnchInterface";


/**基础附魔点数
 * 变量名
 */
export const BASE_ENCH_POINT = "BaseEnchPoint";

/**随机附魔点数
 * 变量名
 */
export const RAND_ENCH_POINT = "RandEnchPoint";

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

export const formatArray = <T>(val:T|T[]|null|undefined)=>
    val==null ? [] : Array.isArray(val) ? val : [val];

/**附魔强度id */
export const enchInsVar = (ench:EnchEffect,t:"u"|"n")=>`${t}_${ench.id}`;

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
    /**比标准更常见的制式品 */
    Poor       :360,
    /**标准 如 保护I/元素打击 */
    Common     :240,
    /**稀有 如 元素爆发 */
    Uncommon   :180,
    /**罕见 如 追加打击I/保护II */
    Rare       :120,
    /**史诗 如 追加打击II */
    Epic       :80 ,
}
/**稀有度点数 */
export const RarityPoints = {
    /**比基础更常见的制式品 */
    Crude  :30,
    /**基础魔法物品 如 保护I/元素打击/元素爆发 2个(120)略高于基础附魔上限(100) */
    Basic  :60,
    /**魔法物品 如 追加打击I/保护II (90)略低于基础附魔上限(100) */
    Magic  :90,
    /**强力魔法物品 如 追加打击II (135)略高于基础附魔上限(100) */
    Randart:135,
    /**神器 独特效果 */
    Artifact:200,
}