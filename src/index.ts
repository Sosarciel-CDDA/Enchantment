import { DataManager } from "@sosarciel-cdda/event";
import * as path from 'path';
import { createDamageType as buildDamageType } from "./DamageType";
import { createEnchantment as buildEnchantment } from "./Enchantment";
import { GAME_MOD_DIR } from "@sosarciel-cdda/schema";
import { DATA_DIR } from "./EMDefine";

const outPath = path.join(GAME_MOD_DIR,'CustomEnch');

async function main(){
    const EnchDm = new DataManager({
        dataPath:DATA_DIR,
        outPath:outPath,
        emPrefix:"CENCHEF",
        hookOpt:{enableMoveStatus:false}
    });
    await buildEnchantment(EnchDm);
    await buildDamageType(EnchDm);
    await EnchDm.saveAllData();
}
main();
