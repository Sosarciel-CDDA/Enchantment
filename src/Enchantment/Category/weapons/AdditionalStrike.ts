import { Flag } from "@sosarciel-cdda/schema";
import { genEnchInfo, genEnchPrefix, genWieldTrigger, numToRoman, createEnchLvlData } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor } from "@/src/Enchantment/EnchInterface";
import { enchLvlID, RarityPoints, RarityWeight } from "@/src/Enchantment/Define";


export const AdditionalStrike = {
    id:"AdditionalStrike",
    max:2,
    ctor:dm=>{
        const enchName = "追加打击";
        //构造等级变体
        const {instance,data} = createEnchLvlData(AdditionalStrike.max,idx=>{
            const lvl = idx+1;
            const name = `${enchName} ${numToRoman(lvl)}`;
            const change = (lvl+1)*10;
            //变体ID
            const ench:Flag = {
                type:"json_flag", name,
                id:enchLvlID(AdditionalStrike.id,lvl),
                info:genEnchInfo('good',name,`这件物品有 ${change}% 的概率多攻击一次`),
                item_prefix:genEnchPrefix('good',name),
            };
            //触发eoc
            const teoc = genWieldTrigger(dm,ench.id,"TryMeleeAttack",[
                {if:{x_in_y_chance:{x:change,y:100}},then:[
                    {u_attack:"tec_none",forced_movecost:1}
                ]}
            ])
            //加入输出
            return {
                instance:{
                    id:AdditionalStrike.id, ench,
                    category:["weapons"],
                    conflicts:["AttackPosition"],
                    weight:[RarityWeight.Rare ,RarityWeight.Epic   ][idx],
                    point :[RarityPoints.Magic,RarityPoints.Randart][idx]
                },
                data:[ench,teoc]
            }
        });

        dm.addData([...data],"ench",AdditionalStrike.id);
        return instance;
    }
} satisfies EnchCtor;