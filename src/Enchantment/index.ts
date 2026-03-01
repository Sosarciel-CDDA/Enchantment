import { DataManager } from "@sosarciel-cdda/event";
import { buildDebugItem } from "./DebugItem";
import { buildCommon } from "./Common";
import { buildIdentifySpell } from "./IdentifySpell";
import { buildRemoveCurseSpell } from "./RemoveCurseSpell";
import { buildEnchCategory } from "./Category";
import { buildSetup } from "./Setup";
import { buildAlias } from "./Alias";




export async function createEnchantment(dm:DataManager){
    const enchDataList = await buildEnchCategory(dm);

    await buildCommon(dm,enchDataList);
    //生成调试道具
    await buildDebugItem(dm,enchDataList);
    await buildIdentifySpell(dm);
    await buildRemoveCurseSpell(dm);
    await buildSetup(dm);
    await buildAlias(dm);
}