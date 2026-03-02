import { DataManager } from "@sosarciel-cdda/event";
import { EnchCtor, EnchInsData, EnchInsDataColumn } from "../EnchInterface.schema";
import { BoolExpr, Flag, FlagID } from "@sosarciel-cdda/schema";
import { deepClone, JObject, memoize, UtilFT } from "@zwa73/utils";
import path from 'pathe';
import { DATA_DIR } from "@/src/EMDefine";
import { formatArray } from "../Define";


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
    const filterType:any[] = ['CustomEnch','CustomEnchColumn'];
    const result = await Promise.all(enchFileList.map(async filepath=>{
        const data = await UtilFT.loadJSONFile<JObject[]>(filepath,{json5:true});
        const parsed = path.parse(path.relative(EnchDir,filepath));

        const rawIns = data.filter(v=>v.type=='CustomEnch') as EnchInsData[];
        const column = data.filter(v=>v.type=='CustomEnchColumn') as EnchInsDataColumn[];
        const columnIns = column.flatMap(buildEnchInsColumn);
        const ins = [...rawIns,...columnIns];

        const flagList = ins.map(buildFlag);
        dm.addData([...flagList,...data.filter(v=>!filterType.includes(v.type))],'ench',parsed.dir,parsed.name);

        return ins;
    })).then(v=>v.flat());
    pushConflictsKey(...result);
    return result;
}


const buildEnchInsColumn = (ins:EnchInsDataColumn)=>{
    const {
        length,column_effect,column_point,column_weight,
        column_name,column_info,column_item_prefix,column_item_suffix,
        ...rest} = ins;
    const result:EnchInsData[] = [];

    const fixedCommEff = formatArray(rest.effect);

    for(let lvl=1;lvl<=length;lvl++){
        const ench = deepClone(rest);
        const fixedEff = formatArray(column_effect?.[lvl-1]);
        ench.effect = [...fixedCommEff,...fixedEff];

        ench.id = `${ench.id}_${lvl}`;
        ench.point = column_point?.[lvl-1] ?? ench.point;
        ench.weight = column_weight?.[lvl-1] ?? ench.weight;
        ench.name = column_name?.[lvl-1] ?? ench.name;
        ench.info = column_info?.[lvl-1] ?? ench.info;
        ench.item_prefix = column_item_prefix?.[lvl-1] ?? ench.item_prefix;
        ench.item_suffix = column_item_suffix?.[lvl-1] ?? ench.item_suffix;
        result.push(ench);
    }
    return result;
}

