import { EnchTypeData } from "./EnchInterface";
import { EMDef } from "@/src/EMDefine";
import { Flag, FlagID } from "@sosarciel-cdda/schema";


/**默认的最大附魔点数 */
export const MAX_ENCH_POINT = 100;
/**最大附魔尝试次数 */
export const MAX_ENCH_COUNT = 10;
/**附魔物品生成 one_in 概率 */
export const ENCH_ONE_IN    = 2;
/**空附魔 one_in 概率 */
export const ENCH_EMPTY_IN  = 10;

/**表示物品完成附魔初始化
 * 变量名
 */
export const COMPLETE_ENCH_INIT = "completedEnchInit";
/**物品附魔点数
 * 变量名
 */
export const ENCH_POINT_CUR = "enchPoint";
/**表述物品的最大附魔点数 需初始化
 * 变量名
 */
export const ENCH_POINT_MAX = "enchPointMax";
/**表示物品的附魔类型 需初始化
 * 变量名
 */
export const ITEM_ENCH_TYPE = "itemEnchType";

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
