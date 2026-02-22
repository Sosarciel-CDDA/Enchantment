import { DataManager } from "@sosarciel-cdda/event";
import { buildArmorEnch } from "./armor";
import { buildWeaponsEnch } from "./weapons";
import { getEnchConflictsID } from "./CategoryBuilder";


export * from "./CategoryBuilder";

export const buildEnchCategory = async (dm:DataManager)=>{
    const enchDataList = await Promise.all([
        ... await buildWeaponsEnch(dm)   ,
        ... await buildArmorEnch(dm)     ,
    ]).then(v=>v.flat());

    //为所有flag添加冲突id
    enchDataList.forEach(data=>{
        data.ench.conflicts = getEnchConflictsID(data).filter(id=>id!=data.ench.id);
    });
    return enchDataList;
}