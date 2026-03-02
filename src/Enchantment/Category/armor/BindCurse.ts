import { genEnchInfo, genEnchPrefix } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor, EnchInsData } from "@/src/Enchantment/EnchInterface.schema";
import { EMDef } from "@/src/EMDefine";


export const BindCurseFlagId = EMDef.genFlagID(`BindCurse_Ench`);

export const BindCurse = {
    id:"BindCurse",
    ctor:dm=>{
        const name = "绑定诅咒";

        //构造附魔集
        const enchData:EnchInsData={
            name,
            id:BindCurseFlagId,
            info:genEnchInfo("bad",name,`这件物品在移除诅咒前无法脱下`),
            item_prefix:genEnchPrefix('bad',name),

            category:["armor"],
            enchant_slot:'prefix',
            add_effects:[
                {npc_set_flag:"INTEGRATED"},
                {u_message:"你从一件装备上发现了绑定诅咒",type:"bad"},
            ],
            remove_effects:[{npc_unset_flag:"INTEGRATED"}],
            is_curse:true,
        };

        return {instance:[enchData]};
    }
} satisfies EnchCtor;
