import { DataManager } from "@sosarciel-cdda/event";
import { EnchTypeData } from "./EnchInterface";
import { buildDebugItem } from "./DebugItem";
import { buildCommon } from "./Common";
import { buildWeaponsEnch } from "./weapons";
import { buildArmorEnch } from "./armor";
import { buildIdentifySpell } from "./IdentifySpell";
import { buildRemoveCurseSpell } from "./RemoveCurseSpell";




export async function createEnchantment(dm:DataManager){
    const enchDataList:EnchTypeData[] = await Promise.all([
        ... await buildWeaponsEnch(dm)   ,
        ... await buildArmorEnch(dm)     ,
    ]);
    //展开附魔等级变体flag
    const enchFlagList = enchDataList.map(enchset=>
        enchset.instance.map(lvlobj => lvlobj.ench)).flat();

    await buildCommon(dm,enchDataList);
    //生成调试道具
    await buildDebugItem(dm,enchFlagList);
    await buildIdentifySpell(dm);
    await buildRemoveCurseSpell(dm);
}