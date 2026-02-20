import { DataManager } from "@sosarciel-cdda/event";
import { Protection } from "./Protection";
import { BindCurse } from "./BindCurse";
import { Fragile } from "./Fragile";
import { buildEnchCate } from "../CategoryBuilder";



export async function buildArmorEnch(dm:DataManager){
    return buildEnchCate(dm,Protection,Fragile,BindCurse);
}