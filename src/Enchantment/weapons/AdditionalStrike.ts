import { Flag } from "@sosarciel-cdda/schema";
import { genLvlConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genWieldTrigger, numToRoman, createEnchLvlData } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { Knockback } from "./Knockback";
import { enchLvlID } from "../Define";


export const AdditionalStrike = {
    id:"AdditionalStrike",
    max:5,
    ctor:dm=>{
        const name = "追加打击";
        //构造等级变体
        const {lvl,data} = createEnchLvlData(AdditionalStrike.max,idx=>{
            const lvl = idx+1;
            const subName = `${name} ${numToRoman(lvl)}`;
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
        });
        //构造附魔集
        const enchData:EnchData={
            id:AdditionalStrike.id, lvl,
            ench_type:["weapons"],
        };
        //互斥附魔flag
        genLvlConfilcts(enchData);
        genEnchConfilcts(enchData,Knockback);
        dm.addData([...data],"ench",AdditionalStrike.id);
        return enchData;
    }
} satisfies EnchCtor;