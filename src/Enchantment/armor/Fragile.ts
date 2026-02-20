import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EMDef } from "@src/EMDefine";
import { range } from "@zwa73/utils";
import { genLvlConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, numToRoman } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID, operaEID } from "../Define";
import { BindCurseLvlFlagId } from "./BindCurse";
import { Protection } from "./Protection";

const dt = ["bash","cut","stab","bullet"] as const;
export const Fragile = {
    id:"Fragile",
    max:3,
    ctor:dm=>{
        const enchName = "脆弱";
        const mainFlag = genMainFlag(Fragile.id,enchName);
        //被动效果
        const effid = EMDef.genEffectID(Fragile.id);
        const enchEffect:Effect = {
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
        //构造附魔集
        const enchData:EnchData={
            id:Fragile.id,
            main:mainFlag,
            intensity_effect: [enchEffect.id],
            ench_type:["armor"],
            lvl:[],
            //负面附魔会附带绑定诅咒
            add_effects:[{run_eocs:operaEID(BindCurseLvlFlagId,"add")}]
        };
        //构造等级变体
        const lvlvar = range(Fragile.max).map(idx=>{
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
            //加入输出
            enchData.lvl.push({
                ench,
                weight:(Fragile.max-idx)/4,
                intensity:lvl,
            });
            return [ench]
        }).drain().flat();

        //互斥附魔flag
        genLvlConfilcts(enchData);
        genEnchConfilcts(enchData,Protection);
        dm.addData([
            mainFlag,enchEffect,
            ...lvlvar,
        ],"ench",Fragile.id);
        return enchData;
    }
} satisfies EnchCtor;