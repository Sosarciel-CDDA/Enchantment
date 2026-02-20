import { Flag } from "@sosarciel-cdda/schema";
import { genEnchInfo, genEnchPrefix, genWieldTrigger, numToRoman, createEnchLvlData } from "@/src/Enchantment/UtilGener";
import { EnchCtor, EnchTypeData } from "@/src/Enchantment/EnchInterface";
import { enchLvlID } from "@/src/Enchantment/Define";


export const AdditionalStrike = {
    id:"AdditionalStrike",
    max:5,
    ctor:dm=>{
        const name = "追加打击";
        //构造等级变体
        const {instance,data} = createEnchLvlData(AdditionalStrike.max,idx=>{
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
                instance:{
                    ench,
                    weight:AdditionalStrike.max-idx,
                    point:lvl*2,
                },
                data:[ench,teoc]
            }
        });
        //构造附魔集
        const enchData:EnchTypeData={
            id:AdditionalStrike.id, instance,
            ench_type:["weapons"],
            conflicts:["AttackPosition"],
        };

        dm.addData([...data],"ench",AdditionalStrike.id);
        return enchData;
    }
} satisfies EnchCtor;