import { DataManager } from "@sosarciel-cdda/event";
import { Knockback } from "./Knockback";
import { AdditionalStrike } from "./AdditionalStrike";
import { buildEnchCate } from "../CategoryBuilder";
import { ElementalStrike } from "./ElementalStrike";
import { ElementalBlast } from "./ElementalBlast";
import { Sharpness } from "./Sharpness";
import { Dullness } from "./Dullness";
import { Enhance } from "./Enhance";



export async function buildWeaponsEnch(dm:DataManager){
    return buildEnchCate(dm,
        Knockback,AdditionalStrike,ElementalStrike,ElementalBlast,
        Sharpness,Dullness,Enhance
    );
}