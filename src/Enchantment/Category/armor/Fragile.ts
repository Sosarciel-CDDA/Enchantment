import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EMDef } from "@/src/EMDefine";
import { genEnchInfo, genEnchPrefix, numToRoman, createEnchLvlData } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor, EnchTypeData } from "@/src/Enchantment/EnchInterface";
import { enchLvlID, operaEID } from "@/src/Enchantment/Define";
import { BindCurseLvlFlagId } from "./BindCurse";

const dt = ["bash","cut","stab","bullet"] as const;
export const Fragile = {
    id:"Fragile",
    max:3,
    ctor:dm=>{
        const enchName = "脆弱";
        //被动效果
        const effid = EMDef.genEffectID(Fragile.id);
        const eff:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果提供 10% 物理伤害减免`],
            max_intensity:7,
            enchantments:[{
                condition:"ALWAYS",
                incoming_damage_mod_post_absorbed:dt.map(type=>(
                    {type,multiply:{math:[`u_effect_intensity('${effid}') * 0.1`]}}
                ))
            }]
        }

        //构造等级变体
        const {instance,data} = createEnchLvlData(Fragile.max,idx=>{
            const lvl = idx+1;
            const subName = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(Fragile.id,lvl),
                name:subName,
                info:genEnchInfo("bad",subName,`这件物品会增加 ${lvl*10}% 所受到的物理伤害`),
                item_prefix:genEnchPrefix('bad',subName),
            };
            return {
                instance:{
                    ench,
                    weight:(Fragile.max-idx)/4,
                    intensity:lvl,
                },
                data:[ench]
            }
        });

        //构造附魔集
        const enchData:EnchTypeData={
            id:Fragile.id, instance,
            intensity_effect: [effid],
            category:["armor"],
            //负面附魔会附带绑定诅咒
            add_effects:[{run_eocs:operaEID(BindCurseLvlFlagId,"add")}],
            conflicts:["Protection"],
        };

        dm.addData([eff,...data],"ench",Fragile.id);
        return enchData;
    }
} satisfies EnchCtor;