import { DamageTypeID, Flag, Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, EMDef } from "@src/EMDefine";
import { range } from "@zwa73/utils";
import { genBaseConfilcts, genEnchConfilcts, genEnchInfo, genEnchPrefix, genMainFlag, genWieldTrigger, numToRoman } from "../UtilGener";
import { EnchCtor, EnchData } from "../EnchInterface";
import { enchLvlID } from "../Common";
import { AdditionalStrike } from "./AdditionalStrike";



export const Knockback = {
    id:"Knockback",
    max:5,
    ctor:dm=>{
        const enchName = "击退";
        const mainFlag = genMainFlag(Knockback.id,enchName);
        //构造附魔集
        const enchData:EnchData={
            id:Knockback.id,
            main:mainFlag,
            ench_type:["weapons"],
            lvl:[]
        };
        //触发法术
        const tspell:Spell = {
            id:EMDef.genSpellID(`${Knockback.id}_Trigger`),
            type:"SPELL",
            flags:[...CON_SPELL_FLAG],
            min_damage:1,
            max_damage:Knockback.max,
            damage_increment:1,
            max_level:Knockback.max-1,
            damage_type:"Knockback" as DamageTypeID,
            effect:"attack",
            shape:"blast",
            valid_targets:["ally","hostile","self"],
            name:`${enchName} 附魔触发法术`,
            description: `${enchName} 附魔触发法术`
        }
        //构造等级变体
        const lvlvar = range(Knockback.max).map(idx=>{
            const lvl = idx+1;
            const subName = `${enchName} ${numToRoman(lvl)}`;
            //变体ID
            const ench:Flag = {
                type:"json_flag",
                id:enchLvlID(Knockback.id,lvl),
                name:subName,
                info:genEnchInfo('pink',subName,`这件物品可以造成 ${lvl} 点击退伤害`),
                item_prefix:genEnchPrefix('pink',subName),
            };
            //触发eoc
            const teoc = genWieldTrigger(dm,ench.id,"TryMeleeAttack",[
                {npc_location_variable:{context_val:`${Knockback.id}_loc`}},
                {u_cast_spell:{id:tspell.id,min_level:idx},loc:{context_val:`${Knockback.id}_loc`}}
            ])
            //加入输出
            enchData.lvl.push({
                ench,
                weight:Knockback.max-idx,
                point:lvl*2,
            });
            return [ench,teoc]
        }).drain().flat();
        //互斥附魔flag
        genBaseConfilcts(enchData);
        genEnchConfilcts(enchData,AdditionalStrike);
        dm.addData([
            mainFlag, tspell, ...lvlvar,
        ],"ench",Knockback.id);
        return enchData;
    }
} satisfies EnchCtor;