import { EMDef } from "@/src/EMDefine";
import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EnchCtor } from "../../EnchInterface";
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

            const flag:Flag = {
                type:"json_flag", name,
                id:enchLvlID(Enhance.id,lvl),
                info:genEnchInfo("good",name,`这件物品可以提升 ${lvl*10+10}% 造成的物理伤害`),
                item_suffix:` <color_white>+${lvl}</color>`,
            };

            return {
                instance:{
                    id:Enhance.id,flag,
                    category:["weapons" as const],
                    conflicts:["Enhance"],
                    enchant_slot:'suffix',
                    effect:[{id:effid,value:lvl+1}],
                    weight:RarityWeight.Common/lvl,
                },
                data:[flag]
            }
        });

        dm.addData([eff,...data],"ench",Enhance.id);
        return instance;
    }
} satisfies EnchCtor;
