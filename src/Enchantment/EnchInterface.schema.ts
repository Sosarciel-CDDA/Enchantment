import { DataManager } from "@sosarciel-cdda/event";
import { AnyCddaJson, BoolExpr, EffectID, EocEffect, Flag, ItemSearchData } from "@sosarciel-cdda/schema";
import { JObject, MPromise } from "@zwa73/utils";
import { MAX_HIDE_ENCH_COUNT, MAX_PREFIX_ENCH_COUNT, MAX_SUFFIX_ENCH_COUNT } from "./Define";

/**可用的附魔类型 列表 */
export const VaildEnchCategoryList = [
    "weapons"   ,
    "armor"     ,
    //"food"      ,
] as const;
/**可用的附魔类型 */
export type VaildEnchCategory = typeof VaildEnchCategoryList[number];
type CategoryCond = {search_data:ItemSearchData[],condition?:BoolExpr};
/**附魔类型映射 */
export const EnchTypeSearchDataMap:Record<VaildEnchCategory,CategoryCond> = {
    weapons :{search_data:[{category:"weapons"}]} ,
    armor   :{search_data:[{category:"armor"}]}   ,
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
    worn  :[{worn_only:true}]    ,
    //food    :[{flags:["EATEN_HOT"]},{flags:["SMOKABLE"]}],
}

export type EnchEffect = {id:EffectID,value:number};

export const EnchSlotMaxVarMap:Record<EnchSlot,string> = {
    prefix:MAX_PREFIX_ENCH_COUNT,
    suffix:MAX_SUFFIX_ENCH_COUNT,
    hide  :MAX_HIDE_ENCH_COUNT
} as const;
export const EnchSlotList = ['prefix','suffix','hide'] as const;
export type EnchSlot = typeof EnchSlotList[number];
/**附魔类型中的某个实例的数据 */
export type EnchInsData = {
    /**附魔点数  
     * 未定义则为0  
     */
    point?:number;
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
    /**是一个可以被移除诅移除的诅咒  
     * 默认false  
     */
    is_curse?:boolean;
    /**附魔槽位 */
    enchant_slot:EnchSlot;
    /**限制类型 */
    category:VaildEnchCategory[];
    /**强度生效方式 undefined时为全部 */
    effect_active_cond?:EffectActiveCond[];
    /**冲突键组
     * 冲突键组相交的附魔互相冲突
     */
    conflicts_key?:string[];
}&Omit<Flag,'type'>;

/**附魔构造器 */
export type EnchCtor = {
    /**附魔id */
    id  :string;
    /**附魔最大值 默认1 */
    max?:number;
    ctor:(dm:DataManager)=>MPromise<{instance:EnchInsData[],data?:JObject[]}>;
}

export type EnchInsDataColumn = EnchInsData&{
    /**附魔集
     * 会按照length创建多个等级变体
     * column_x 字段将会按变体等级合并或是覆盖到不同成员
     * 其他字段为所有变体共用
     */
    type:"CustomEnchColumn"
    /**附魔集长度 */
    length:number;
    /**附魔强度导致的效果
     * 按变体等级应用成员
     */
    column_effect?:(EnchEffect[]|EnchEffect)[];
    /**附魔点数  
     * 按变体等级应用成员
     */
    column_point?:number[];
    /**随机权重  
     * 按变体等级应用成员
     */
    column_weight?:number[];
    /**名称  
     * 按变体等级应用成员
     */
    column_name?:string[];
    /**描述  
     * 按变体等级应用成员
     */
    column_info?:string[];
    /**物品前缀  
     * 按变体等级应用成员
     */
    column_item_prefix?:string[];
    /**物品后缀  
     * 按变体等级应用成员
     */
    column_item_suffix?:string[];
}

/**json附魔表单 */
export type EnchJsonTable = ((EnchInsData&{
    /**附魔 */
    type:"CustomEnch"
})|EnchInsDataColumn|AnyCddaJson)[];