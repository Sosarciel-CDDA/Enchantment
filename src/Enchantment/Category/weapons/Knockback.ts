import { DamageTypeID, Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, EMDef } from "@/src/EMDefine";
import { genEnchInfo, genEnchPrefix, genWieldTrigger, numToRoman, createEnchLvlData } from "@/src/Enchantment/Category/UtilGener";
import { EnchCtor } from "@/src/Enchantment/EnchInterface.schema";
import { enchLvlID, RarityPoints, RarityWeight } from "@/src/Enchantment/Define";



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
            const name = `${enchName} ${numToRoman(lvl)}`;
            const id = enchLvlID(Knockback.id,lvl);
            //触发eoc
            const teoc = genWieldTrigger(dm,id,"TryMeleeAttack",[
                {npc_location_variable:{context_val:`${Knockback.id}_loc`}},
                {u_cast_spell:{id:tspell.id,min_level:idx},loc:{context_val:`${Knockback.id}_loc`}}
            ])
            return {
                instance:{
                    name, id,
                    info:genEnchInfo('pink',name,`这件物品可以造成 ${lvl} 点击退伤害`),
                    item_prefix:genEnchPrefix('pink',name),

                    category:["weapons"],
                    conflicts_key:["AttackPosition"],
                    enchant_slot:'prefix',
                    weight:[RarityWeight.Uncommon,RarityWeight.Rare ][idx],
                    point :[RarityPoints.Basic   ,RarityPoints.Magic][idx]
                },
                data:[teoc]
            }
        });

        return {instance,data:[tspell, ...data]};
    }
} satisfies EnchCtor;