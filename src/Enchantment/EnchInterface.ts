import { DataManager } from "@sosarciel-cdda/event";
import { EffectID, EocEffect, Flag, ItemSearchData } from "@sosarciel-cdda/schema";
import { MPromise } from "@zwa73/utils";

/**可用的附魔类型 列表 */
export const VaildEnchCategoryList = [
    "weapons"   ,
    "armor"     ,
    //"food"      ,
] as const;
/**可用的附魔类型 */
export type VaildEnchCategory = typeof VaildEnchCategoryList[number];
/**附魔类型映射 */
export const EnchTypeSearchDataMap:Record<VaildEnchCategory,ItemSearchData[]> = {
    weapons :[{category:"weapons"}] ,
    armor   :[{category:"armor"}]   ,
    //food    :[{flags:["EATEN_HOT"]},{flags:["SMOKABLE"]}],
}

/**附魔强度效果的生效时机 列表 */
export const EffectActiveCondList = [
    "wield",
    "worn",
] as const;
/**附魔强度效果的生效时机 */
export type EffectActiveCond = typeof EffectActiveCondList[number];
/**生效时机映射 */
export const EffectActiveCondSearchDataMap:Record<EffectActiveCond,ItemSearchData[]> = {
    wield :[{wielded_only:true}] ,
    worn   :[{worn_only:true}]   ,
    //food    :[{flags:["EATEN_HOT"]},{flags:["SMOKABLE"]}],
}

export type EnchEffect = {id:EffectID,value:number};
/**附魔类型中的某个实例的数据 */
export type EnchInsData = {
    /**id */
    id:string;
    /**附魔标志 */
    ench:Flag;
    /**随机权重 */
    weight?:number;
    /**添加时会执行的effect */
    add_effects?:EocEffect[];
    /**移除时会执行的effect */
    remove_effects?:EocEffect[];
    /**附魔强度导致的效果
     * 未定义则不计入缓存
     */
    effect?:EnchEffect[]|EnchEffect;
    /**附魔点数  
     * 未定义则为0  
     */
    point?:number;
    /**是一个可以被移除诅移除的诅咒  
     * 默认false  
     */
    is_curse?:boolean;
    /**限制类型 */
    category:VaildEnchCategory[];
    /**强度生效方式 undefined时为全部 */
    effect_active_cond?:EffectActiveCond[];
    /**冲突键组
     * 冲突键组相交的附魔互相冲突
     */
    conflicts?:string[];
}

/**附魔构造器 */
export type EnchCtor = {
    /**附魔id */
    id  :string;
    /**附魔最大值 默认1 */
    max?:number;
    ctor:(dm:DataManager)=>MPromise<EnchInsData[]>;
}
