import { EMDef } from "@/src/EMDefine";
import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EnchCtor } from "../../EnchInterface";
import { enchLvlID, RarityPoints, RarityWeight } from "../../Define";
import { createEnchLvlData, genEnchInfo, genEnchPrefix, numToRoman } from "../UtilGener";

export const Sharpness = {
    id:"Sharpness",
    max:2,
    ctor:dm=>{
        const enchName = "锋利";

        const effid = EMDef.genEffectID(Sharpness.id);
        const eff:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果提供 10% 物理伤害提升`],
            max_intensity:3,
            enchantments:[{
                condition:"ALWAYS",
                values:[
                    {value:"MELEE_DAMAGE",multiply:{math:[`u_effect_intensity('${effid}') * 0.1`]}}
                ]
            }]
        };

        const {instance,data} = createEnchLvlData(Sharpness.max,idx=>{
            const lvl = idx+1;
            const name = `${enchName} ${numToRoman(lvl)}`;

            const flag:Flag = {
                type:"json_flag", name,
                id:enchLvlID(Sharpness.id,lvl),
                info:genEnchInfo("good",name,`这件物品可以提升 ${lvl*10+10}% 造成的物理伤害`),
                item_prefix:genEnchPrefix('good',name),
            };

            return {
                instance:{
                    id:Sharpness.id,flag,
                    category:["weapons"],
                    conflicts:["Sharpness"],
                    effect:[{id:effid,value:lvl+1}],
                    weight:[RarityWeight.Common,RarityWeight.Rare][idx],
                    point :[RarityPoints.Basic,RarityPoints.Magic][idx],
                },
                data:[flag]
            }
        });

        dm.addData([eff,...data],"ench",Sharpness.id);
        return instance;
    }
} satisfies EnchCtor;
