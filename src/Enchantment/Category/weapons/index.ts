import { DataManager } from "@sosarciel-cdda/event";
import { Knockback } from "./Knockback";
import { AdditionalStrike } from "./AdditionalStrike";
import { buildEnchCate } from "../CategoryBuilder";
import { ElementalStrike } from "./ElementalStrike";
import { ElementalBlast } from "./ElementalBlast";



export async function buildWeaponsEnch(dm:DataManager){
    return buildEnchCate(dm,
        Knockback,AdditionalStrike,ElementalStrike,ElementalBlast
    );
}