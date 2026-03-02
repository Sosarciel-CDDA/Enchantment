import { DataManager } from "@sosarciel-cdda/event";
import { buildArmorEnch } from "./armor";
import { buildWeaponsEnch } from "./weapons";
import { loadJsonEnch } from "./JsonLoader";


export * from "./CategoryBuilder";

export const buildEnchCategory = async (dm:DataManager)=>{
    const enchDataList = await Promise.all([
        ... await buildWeaponsEnch(dm)   ,
        ... await buildArmorEnch(dm)     ,
        ... await loadJsonEnch(dm),
    ]).then(v=>v.flat());
    return enchDataList;
}