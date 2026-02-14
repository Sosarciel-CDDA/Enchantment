import { Effect, Flag } from "@sosarciel-cdda/schema";
import { EMDef } from "@src/EMDefine";
import { JObject } from "@zwa73/utils";
import { genBaseConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, numToRoman } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID } from "../Common";
import { Fragile } from "./Fragile";


export const Protection = {
    id:"Protection",
    max:5,
    ctor:dm=>{
        const enchName = "保护";
        const out:JObject[]=[];

        //被动效果
        const effid = EMDef.genEffectID(Protection.id);
        const enchEffect:Effect = {
            type:"effect_type",
            id:effid,
            name:[`${enchName} 附魔效果`],
            desc:[`${enchName} 附魔正在生效 每层效果提供 5% 物理伤害减免`],
            max_intensity:15,
            enchantments:[{
                condition:"ALWAYS",
                incoming_damage_mod_post_absorbed:[{
                    type:"bash",
                    multiply:{math:[`u_effect_intensity('${effid}') * -0.05`]},
                },{
                    type:"cut",
                    multiply:{math:[`u_effect_intensity('${effid}') * -0.05`]},
                },{
                    type:"stab",
                    multiply:{math:[`u_effect_intensity('${effid}') * -0.05`]},
                },{
                    type:"bullet",
                    multiply:{math:[`u_effect_intensity('${effid}') * -0.05`]},
                }]
            }]
        }
        out.push(enchEffect);

        //构造附魔集
        const enchData:EnchData={
            id:Protection.id,
            main:genMainFlag(Protection.id,enchName),
            intensity_effect: [enchEffect.id],
            ench_type:["armor"],
            lvl:[]
        };
        out.push(enchData.main);
        //构造等级变体
        for(let i=1;i<=Protection.max;i++){
            const subName = `${enchName} ${numToRoman(i)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(Protection.id,i),
                name:subName,
                info:genEnchInfo("good",subName,`这件物品可以降低 ${i*5}% 所受到的物理伤害`),
                item_prefix:genEnchPrefix('good',subName),
            };
            //加入输出
            out.push(ench);
            enchData.lvl.push({
                ench,
                weight:Protection.max+1-i,
                intensity:i,
                point:i*10,
            });
        }

        //互斥附魔flag
        genBaseConfilcts(enchData);
        genEnchConfilcts(enchData,Fragile);
        dm.addData(out,"ench",Protection.id);
        return enchData;
    }
} satisfies EnchCtor;