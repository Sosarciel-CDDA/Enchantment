import { EMDef } from "@/src/EMDefine";
import { Effect } from "@sosarciel-cdda/schema";
import { EnchCtor } from "../../EnchInterface.schema";
import { enchLvlID, RarityWeight } from "../../Define";
import { createEnchLvlData, genEnchInfo, numToRoman } from "../UtilGener";

export const Enhance = {
    id:"Enhance",
    max:5,
    ctor:dm=>{
        const enchName = "武器强化";

        const effid = EMDef.genEffectID(Enhance.id);
        const eff:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果提供 2 钝击伤害`],
            max_intensity:Enhance.max,
            enchantments:[{
                condition:"ALWAYS",
                melee_damage_bonus:[{type:"bash",add:{math:[`u_effect_intensity('${effid}') * 2`]}}]
            }]
        };

        const {instance,data} = createEnchLvlData(Enhance.max,idx=>{
            const lvl = idx+1;
            const name = `${enchName} ${numToRoman(lvl)}`;
            const id = enchLvlID(Enhance.id,lvl);

            return {
                instance:{
                    name, id,
                    info:genEnchInfo("good",name,`这件物品可以提升 ${lvl*10+10}% 造成的物理伤害`),
                    item_suffix:` <color_white>+${lvl}</color>`,

                    category:["weapons" as const],
                    conflicts_key:["Enhance"],
                    enchant_slot:'suffix',
                    effect:[{id:effid,value:lvl}],
                    weight:RarityWeight.Common/lvl,
                }
            }
        });

        return {instance,data:[eff,...data]};
    }
} satisfies EnchCtor;
