import { DataManager } from "@sosarciel-cdda/event";
import { EnchData } from "./EnchInterface";
import { buildDebugItem } from "./DebugItem";
import { flatEnchFlag, buildCommon } from "./Common";
import { weaponsEnch } from "./weapons";
import { armorEnch } from "./armor";
import { buildIdentifySpell } from "./IdentifySpell";
import { buildRemoveCurseSpell } from "./RemoveCurseSpell";




export async function createEnchantment(dm:DataManager){
    const enchDataList:EnchData[] = await Promise.all([
        ... await weaponsEnch(dm)   ,
        ... await armorEnch(dm)     ,
    ]);
    //预处理并展开附魔flag
    const enchFlagList = await flatEnchFlag(enchDataList);
    await buildCommon(dm,enchDataList);
    //生成调试道具
    await buildDebugItem(dm,enchFlagList);
    await buildIdentifySpell(dm);
    await buildRemoveCurseSpell(dm);
}