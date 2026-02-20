import { Flag } from "@sosarciel-cdda/schema";
import { range } from "@zwa73/utils";
import { genLvlConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, genWieldTrigger, numToRoman } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { Knockback } from "./Knockback";
import { enchLvlID } from "../Define";


export const AdditionalStrike = {
    id:"AdditionalStrike",
    max:5,
    ctor:dm=>{
        const enchName = "追加打击";
        const mainFlag = genMainFlag(AdditionalStrike.id,enchName);
        //构造等级变体
        const lvldat = range(AdditionalStrike.max).map(idx=>{
            const lvl = idx+1;
            const subName = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(AdditionalStrike.id,lvl),
                name:subName,
                info:genEnchInfo('pink',subName,`这件物品有 ${(lvl+1)*10}% 的概率多攻击一次`),
                item_prefix:genEnchPrefix('pink',subName),
            };
            //触发eoc
            const teoc = genWieldTrigger(dm,ench.id,"TryMeleeAttack",[
                {if:{x_in_y_chance:{x:lvl+1,y:10}},then:[
                    {u_attack:"tec_none",forced_movecost:1}
                ]}
            ])
            //加入输出
            return {
                lvl:{
                    ench,
                    weight:AdditionalStrike.max-idx,
                    point:lvl*2,
                },
                data:[ench,teoc]
            }
        }).drain();
        //构造附魔集
        const enchData:EnchData={
            id:AdditionalStrike.id,
            main:mainFlag,
            ench_type:["weapons"],
            lvl:lvldat.map(v=>v.lvl),
        };
        //互斥附魔flag
        genLvlConfilcts(enchData);
        genEnchConfilcts(enchData,Knockback);
        dm.addData([
            mainFlag, ...lvldat.map(v=>v.data).flat(),
        ],"ench",AdditionalStrike.id);
        return enchData;
    }
} satisfies EnchCtor;