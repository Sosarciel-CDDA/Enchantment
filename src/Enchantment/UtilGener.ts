import { EMDef } from "@src/EMDefine";
import { CharHook, DataManager } from "@sosarciel-cdda/event";
import { BoolExpr, Color, ColorList, EocEffect, FlagID } from "@sosarciel-cdda/schema";
import { EnchCtor, EnchData, EnchLvlData } from "./EnchInterface";
import { enchLvlID } from "./Define";
import { JObject, range } from "@zwa73/utils";



/**手持触发 */
export function genWieldTrigger(dm:DataManager,flagId:FlagID,hook:CharHook,effects:EocEffect[],condition?:BoolExpr){
    const eoc = EMDef.genActEoc(`${flagId}_WieldTigger`,effects,{and:[
        {u_has_wielded_with_flag:flagId},
        ...(condition ? [condition] : [])
    ]});
    dm.addInvokeEoc(hook,0,eoc);
    return eoc;
}

export function numToRoman(num:number) {
    const romanNumerals = {
        M : 1000,
        CM: 900 ,
        D : 500 ,
        CD: 400 ,
        C : 100 ,
        XC: 90  ,
        L : 50  ,
        XL: 40  ,
        X : 10  ,
        IX: 9   ,
        V : 5   ,
        IV: 4   ,
        I : 1   ,
    } as const;
    let roman = '';
    for (const key in romanNumerals) {
        const fixk = key as (keyof typeof romanNumerals)
        while (num >= romanNumerals[fixk]) {
            roman += key;
            num -= romanNumerals[fixk];
        }
    }
    return roman;
}

/**添加同附魔lvl变体的基础互斥 */
export function genLvlConfilcts(enchData:EnchData){
    enchData.lvl.forEach(lvlobj=>{
        const ench = lvlobj.ench;
        ench.conflicts = ench.conflicts??[];
        ench.conflicts.push(...enchData.lvl
            .filter(sublvlobj=>sublvlobj.ench.id!=ench.id)
            .map(subelvlobj=>subelvlobj.ench.id))
    })
}

/**根据ID与最大等级添加附魔互斥 */
export function genEnchConfilcts(base:EnchData,target:EnchCtor){
    base.lvl.forEach(lvlobj=>{
        const ench = lvlobj.ench;
        ench.conflicts = ench.conflicts??[];
        for(let lvl=1;lvl<=(target.max??1);lvl++)
            ench.conflicts.push(enchLvlID(target.id,lvl))
    })
}

/**生成附魔说明 */
export function genEnchInfo(color:Color|"good"|"bad",name:string,desc:string){
    if(ColorList.includes(color as Color))
        return `<color_${color}>[${name}]</color> ${desc}`;
    return `<${color}>[${name}]</${color}> ${desc}`;
}

/**生成附魔前缀 */
export function genEnchPrefix(color:Color|"good"|"bad",name:string){
    if(ColorList.includes(color as Color))
        return `<color_${color}>[${name}]</color> `;
    return `<${color}>[${name}]</${color}> `;
}

/**创建等级数据 */
export function createEnchLvlData(max:number,fn:(idx:number)=>{lvl:EnchLvlData,data?:JObject[]}){
    return range(max).map(idx=>fn(idx)).drain().reduce((acc,cur)=>({
            lvl:[...acc.lvl,cur.lvl],
            data:[...acc.data,...cur.data??[]]
        }),{lvl:[],data:[]} as {lvl:EnchLvlData[],data:JObject[]});
}