import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EMDef } from "@src/EMDefine";
import { genLvlConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, numToRoman, createEnchLvlData } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID } from "../Define";
import { Fragile } from "./Fragile";


const dt = ["bash","cut","stab","bullet"] as const;
export const Protection = {
    id:"Protection",
    max:3,
    ctor:dm=>{
        const enchName = "保护";
        const main = genMainFlag(Protection.id,enchName);
        //被动效果
        const effid = EMDef.genEffectID(Protection.id);
        const eff:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果提供 10% 物理伤害减免`],
            max_intensity:7,
            enchantments:[{
                condition:"ALWAYS",
                incoming_damage_mod_post_absorbed:dt.map(type=>(
                    {type,multiply:{math:[`u_effect_intensity('${effid}') * -0.1`]}}
                ))
            }]
        }

        //构造等级变体
        const {lvl} = createEnchLvlData(Protection.max,idx=>{
            const lvl = idx+1;
            const subName = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(Protection.id,lvl),
                name:subName,
                info:genEnchInfo("good",subName,`这件物品可以降低 ${lvl*10}% 所受到的物理伤害`),
                item_prefix:genEnchPrefix('good',subName),
            };
            return {lvl:{
                ench,
                weight:Protection.max-idx,
                intensity:lvl,
                point:lvl*10,
            }}
        });

        //构造附魔集
        const enchData:EnchData={
            id:Protection.id,
            main, lvl,
            intensity_effect: [effid],
            ench_type:["armor"],
        };

        //互斥附魔flag
        genLvlConfilcts(enchData);
        genEnchConfilcts(enchData,Fragile);
        dm.addData([
            main,eff,
            ...lvl.map(v=>v.ench),
        ],"ench",Protection.id);
        return enchData;
    }
} satisfies EnchCtor;