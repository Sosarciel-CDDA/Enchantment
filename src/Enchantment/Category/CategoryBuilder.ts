import { DataManager } from "@sosarciel-cdda/event";
import { EnchCtor, EnchInsData } from "../EnchInterface";
import { BoolExpr, FlagID } from "@sosarciel-cdda/schema";
import { memoize } from "@zwa73/utils";




/**冲突键索引 */
const ConflictsIdx:Record<string,Set<FlagID>> = {};
/**构造附魔类型 */
export async function buildEnchCate(dm:DataManager,...ctorList:EnchCtor[]){
    const resultList = await Promise.all(ctorList.map(ctor=>ctor.ctor(dm))).then(v=>v.flat());
    resultList.forEach(v=>v.conflicts?.forEach(c=>{
        ConflictsIdx[c]??=new Set();
        ConflictsIdx[c].add(v.flag.id)
    }));
    return resultList;
}

/**获取冲突id */
export const getEnchConflictsID = memoize((target:EnchInsData)=>{
    const conflicts = new Set<FlagID>();
    target.conflicts?.forEach(c=>
        ConflictsIdx[c]?.forEach(id=>conflicts.add(id)));
    return Array.from(conflicts);
});

/**获取冲突条件 物品为n */
export const getEnchConflictsExpr = (target:EnchInsData)=>{
    return {or:getEnchConflictsID(target).map(id=>({npc_has_flag:id}) satisfies BoolExpr)} as BoolExpr;
};
