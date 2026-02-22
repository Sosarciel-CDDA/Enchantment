import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EMDef } from "@/src/EMDefine";
import { genEnchInfo, genEnchPrefix, numToRoman, createEnchLvlData } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor } from "@/src/Enchantment/EnchInterface";
import { enchLvlID, RarityPoints, RarityWeight } from "@/src/Enchantment/Define";


const dt = ["bash","cut","stab","bullet"] as const;
export const Protection = {
    id:"Protection",
    max:2,
    ctor:dm=>{
        const enchName = "保护";
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
        const {instance,data} = createEnchLvlData(Protection.max,idx=>{
            const lvl = idx+1;
            const name = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag", name,
                id:enchLvlID(Protection.id,lvl),
                info:genEnchInfo("good",name,`这件物品可以降低 ${lvl*10+10}% 所受到的物理伤害`),
                item_prefix:genEnchPrefix('good',name),
            };
            return {
                instance:{
                    id:Protection.id,ench,
                    category:["armor"],
                    conflicts:["Protection"],
                    intensity:[{id:effid,value:lvl+1}],
                    weight:[RarityWeight.Common,RarityWeight.Rare ][idx],
                    point :[RarityPoints.Basic ,RarityPoints.Magic][idx],
                },
                data:[ench]
            }
        });

        dm.addData([eff,...data],"ench",Protection.id);
        return instance;
    }
} satisfies EnchCtor;