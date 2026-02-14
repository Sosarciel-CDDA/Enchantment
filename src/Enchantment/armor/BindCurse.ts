import { Flag } from "@sosarciel-cdda/schema";
import { JObject } from "@zwa73/utils";
import { genEnchInfo, genEnchPrefix, genMainFlag } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID } from "../Common";


export const BindCurse = {
    id:"BindCurse",
    max:1,
    ctor:dm=>{
        const enchName = "绑定诅咒";
        const out:JObject[]=[];

        //构造附魔集
        const enchData:EnchData={
            id:BindCurse.id,
            main:genMainFlag(BindCurse.id,enchName),
            ench_type:["armor"],
            lvl:[],
            is_curse:true
        };
        out.push(enchData.main);
        //构造等级变体
        //变体ID
        const ench:Flag = {
            type:"json_flag",
            id:BindCurseLvlFlagId,
            name:enchName,
            info:genEnchInfo("bad",enchName,`这件物品在移除诅咒前无法脱下`),
            item_prefix:genEnchPrefix('bad',enchName),
        };
        //加入输出
        out.push(ench);
        enchData.lvl.push({ench,
            add_effects:[
                {npc_set_flag:"INTEGRATED"},
                {u_message:"你从一件装备上发现了绑定诅咒",type:"bad"},
            ],
            remove_effects:[{npc_unset_flag:"INTEGRATED"}],
        });

        dm.addData(out,"ench",BindCurse.id);
        return enchData;
    }
} satisfies EnchCtor;

export const BindCurseLvlFlagId = enchLvlID(BindCurse.id,1);