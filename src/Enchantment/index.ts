import { DataManager } from "@sosarciel-cdda/event";
import { buildDebugItem } from "./DebugItem";
import { buildCommon } from "./Common";
import { buildIdentifySpell } from "./IdentifySpell";
import { buildRemoveCurseSpell } from "./RemoveCurseSpell";
import { buildEnchCategory } from "./Category";
import { buildSetup } from "./Setup";




export async function createEnchantment(dm:DataManager){
    const enchDataList = await buildEnchCategory(dm);

    //展开附魔等级变体flag
    const enchFlagList = enchDataList.flatMap(enchset=>
        enchset.instance.map(ins => ins.ench));

    await buildCommon(dm,enchDataList);
    //生成调试道具
    await buildDebugItem(dm,enchFlagList);
    await buildIdentifySpell(dm);
    await buildRemoveCurseSpell(dm);
    await buildSetup(dm);
}