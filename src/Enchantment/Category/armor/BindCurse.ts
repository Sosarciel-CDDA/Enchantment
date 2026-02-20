import { Flag } from "@sosarciel-cdda/schema";
import { genEnchInfo, genEnchPrefix } from "@/src/Enchantment/UtilGener";
import { EnchCtor, EnchTypeData } from "@/src/Enchantment/EnchInterface";
import { enchLvlID } from "@/src/Enchantment/Define";


export const BindCurse = {
    id:"BindCurse",
    ctor:dm=>{
        const enchName = "绑定诅咒";
        const ench:Flag = {
            type:"json_flag",
            id:BindCurseLvlFlagId,
            name:enchName,
            info:genEnchInfo("bad",enchName,`这件物品在移除诅咒前无法脱下`),
            item_prefix:genEnchPrefix('bad',enchName),
        };

        //构造附魔集
        const enchData:EnchTypeData={
            id:BindCurse.id,
            ench_type:["armor"],
            instance:[{
                ench,
                add_effects:[
                    {npc_set_flag:"INTEGRATED"},
                    {u_message:"你从一件装备上发现了绑定诅咒",type:"bad"},
                ],
                remove_effects:[{npc_unset_flag:"INTEGRATED"}],
            }],
            is_curse:true
        };

        dm.addData([ench],"ench",BindCurse.id);
        return enchData;
    }
} satisfies EnchCtor;

export const BindCurseLvlFlagId = enchLvlID(BindCurse.id,1);