import { DamageTypeID, Flag, Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, EMDef } from "@/src/EMDefine";
import { genEnchInfo, genEnchPrefix, genWieldTrigger, numToRoman, createEnchLvlData } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor, EnchTypeData } from "@/src/Enchantment/EnchInterface";
import { enchLvlID } from "@/src/Enchantment/Define";



export const Knockback = {
    id:"Knockback",
    max:2,
    ctor:dm=>{
        const enchName = "击退";
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
        const {instance,data} = createEnchLvlData(Knockback.max,idx=>{
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
            return {
                instance:{
                    ench,
                    weight:Knockback.max-idx,
                    point:lvl*2,
                },
                data:[ench,teoc]
            }
        });

        //构造附魔集
        const enchData:EnchTypeData={
            id:Knockback.id, instance,
            category:["weapons"],
            conflicts:["AttackPosition"],
        };

        dm.addData([tspell, ...data],"ench",Knockback.id);
        return enchData;
    }
} satisfies EnchCtor;