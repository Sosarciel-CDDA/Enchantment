import { Flag } from "@sosarciel-cdda/schema";
import { range } from "@zwa73/utils";
import { genBaseConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, genWieldTrigger, numToRoman } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID } from "../Common";
import { Knockback } from "./Knockback";


export const AdditionalStrike = {
    id:"AdditionalStrike",
    max:5,
    ctor:dm=>{
        const enchName = "追加打击";
        const mainFlag = genMainFlag(AdditionalStrike.id,enchName);
        //构造附魔集
        const enchData:EnchData={
            id:AdditionalStrike.id,
            main:mainFlag,
            ench_type:["weapons"],
            lvl:[]
        };
        //构造等级变体
        const lvlvar = range(AdditionalStrike.max).map(idx=>{
            const lvl = idx+1;
            const subName = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(AdditionalStrike.id,lvl),
                name:subName,
                info:genEnchInfo('pink',subName,`这件物品可以造成 ${lvl} 点击退伤害`),
                item_prefix:genEnchPrefix('pink',subName),
            };
            //触发eoc
            const teoc = genWieldTrigger(dm,ench.id,"TryMeleeAttack",[
                {if:{not:{one_in_chance:lvl+1}},then:[
                    {u_attack:"tec_none",forced_movecost:1}
                ]}
            ])
            //加入输出
            enchData.lvl.push({
                ench,
                weight:AdditionalStrike.max-idx,
                point:lvl*2,
            });
            return [ench,teoc]
        }).drain().flat();
        //互斥附魔flag
        genBaseConfilcts(enchData);
        genEnchConfilcts(enchData,Knockback);
        dm.addData([
            mainFlag, ...lvlvar,
        ],"ench",AdditionalStrike.id);
        return enchData;
    }
} satisfies EnchCtor;