import { EMDef } from "@/src/EMDefine";
import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EnchCtor } from "../../EnchInterface";
import { enchLvlID, RarityWeight } from "../../Define";
import { createEnchLvlData, genEnchInfo, genEnchPrefix, numToRoman } from "../UtilGener";


export const Dullness = {
    id:"Dullness",
    max:2,
    ctor:dm=>{
        const enchName = "钝化";

        const effid = EMDef.genEffectID(Dullness.id);
        const eff:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果降低 10% 造成的物理伤害`],
            max_intensity:3,
            enchantments:[{
                condition:"ALWAYS",
                values:[
                    {value:"MELEE_DAMAGE",multiply:{math:[`u_effect_intensity('${effid}') * -0.1`]}}
                ]
            }]
        };

        const {instance,data} = createEnchLvlData(Dullness.max,idx=>{
            const lvl = idx+1;
            const name = `${enchName} ${numToRoman(lvl)}`;

            const flag:Flag = {
                type:"json_flag", name,
                id:enchLvlID(Dullness.id,lvl),
                info:genEnchInfo("bad",name,`这件物品会减少 ${lvl*10+10}% 造成的物理伤害`),
                item_prefix:genEnchPrefix('bad',name),
            };

            return {
                instance:{
                    id:Dullness.id, flag,
                    category:["weapons"] as const,
                    conflicts:["Sharpness"],
                    effect:[{id:effid,value:lvl+1}],
                    weight:[RarityWeight.Common/4,RarityWeight.Rare/4][idx],
                },
                data:[flag]
            }
        });

        dm.addData([eff,...data],"ench",Dullness.id);
        return instance;
    }
} satisfies EnchCtor;
