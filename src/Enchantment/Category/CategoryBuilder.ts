import { DataManager } from "@sosarciel-cdda/event";
import { EnchCtor, EnchInsData } from "../EnchInterface.schema";
import { BoolExpr, Flag, FlagID } from "@sosarciel-cdda/schema";
import { JObject, memoize, UtilFT } from "@zwa73/utils";
import path from 'pathe';
import { DATA_DIR } from "@/src/EMDefine";


const buildFlag = ({
    id,conflicts,item_prefix,item_suffix,name,info
}:EnchInsData):Flag=>({
    type:"json_flag",
    id,name,info,item_prefix,item_suffix,conflicts,
});

/**冲突键索引 */
const ConflictsIdx:Record<string,Set<FlagID>> = {};
/**构造附魔类型 */
export async function buildEnchCate(dm:DataManager,...ctorList:EnchCtor[]){
    const resultList = await Promise.all(ctorList.map(async ctor=>{
        const {data,instance} = await ctor.ctor(dm);
        const flagList = instance.map(buildFlag);
        dm.addData([...flagList,...data??[]],'ench',ctor.id);
        return instance;
    })).then(v=>v.flat());
    pushConflictsKey(...resultList);
    return resultList;
}

/**加入冲突键 */
export function pushConflictsKey(...insList:EnchInsData[]){
    insList.forEach(v=>v.conflicts_key?.forEach(c=>{
        ConflictsIdx[c]??=new Set();
        ConflictsIdx[c].add(v.id)
    }));
}

/**获取冲突id */
export const getEnchConflictsID = memoize((target:EnchInsData)=>{
    const conflicts = new Set<FlagID>();
    target.conflicts_key?.forEach(c=>
        ConflictsIdx[c]?.forEach(id=>conflicts.add(id)));
    return Array.from(conflicts);
});

/**获取冲突条件 物品为n */
export const getEnchConflictsExpr = (target:EnchInsData)=>{
    return {or:getEnchConflictsID(target).map(id=>({npc_has_flag:id}) satisfies BoolExpr)} as BoolExpr;
};


const EnchDir = path.join(DATA_DIR,'Enchantment');
export const loadJsonEnch = async (dm:DataManager)=>{
    const enchFileList = await UtilFT.fileSearchGlob(EnchDir,'**/*.{json,json5}');
    const result = await Promise.all(enchFileList.map(async filepath=>{
        const data = await UtilFT.loadJSONFile<JObject[]>(filepath,{json5:true});
        const parsed = path.parse(path.relative(EnchDir,filepath));

        const ins = data.filter(v=>v.type=='CustomEnch') as EnchInsData[];
        const flagList = ins.map(buildFlag);
        dm.addData([...flagList,...data.filter(v=>v.type!='CustomEnch')],'ench',parsed.dir,parsed.name);

        return ins;
    })).then(v=>v.flat());
    pushConflictsKey(...result);
    return result;
}
