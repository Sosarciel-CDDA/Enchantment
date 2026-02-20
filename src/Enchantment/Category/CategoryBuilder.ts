import { DataManager } from "@sosarciel-cdda/event";
import { EnchCtor, EnchTypeData } from "../EnchInterface";
import { BoolExpr, FlagID } from "@sosarciel-cdda/schema";
import { memoize } from "@zwa73/utils";




/**冲突键索引 */
const ConflictsIdx:Record<string,Set<FlagID>> = {};
/**构造附魔类型 */
export async function buildEnchCate(dm:DataManager,...ctorList:EnchCtor[]){
    const resultList = await Promise.all(ctorList.map(ctor=>ctor.ctor(dm)));
    resultList.forEach(v=>v.conflicts?.forEach(c=>{
        ConflictsIdx[c]??=new Set();
        v.instance.forEach(lvlobj=>ConflictsIdx[c].add(lvlobj.ench.id));
    }));
    return resultList;
}

/**获取冲突id */
export const getEnchConflictsID = memoize((target:EnchTypeData)=>{
    const conflicts = new Set<FlagID>();
    target.conflicts?.forEach(c=>
        ConflictsIdx[c]?.forEach(id=>conflicts.add(id)));
    return Array.from(conflicts);
});

/**获取冲突条件 物品为n */
export const getEnchConflictsExpr = (target:EnchTypeData)=>{
    return {or:getEnchConflictsID(target).map(id=>({npc_has_flag:id}) satisfies BoolExpr)} as BoolExpr;
};
