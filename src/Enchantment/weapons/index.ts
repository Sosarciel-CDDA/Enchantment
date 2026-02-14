import { DataManager } from "@sosarciel-cdda/event";
import { Knockback } from "./Knockback";
import { AdditionalStrike } from "./AdditionalStrike";



export async function weaponsEnch(dm:DataManager){
    return await Promise.all([
        await Knockback.ctor(dm),
        await AdditionalStrike.ctor(dm),
    ])
}