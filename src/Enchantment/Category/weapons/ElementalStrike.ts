import { CON_SPELL_FLAG, EMDef } from "@/src/EMDefine";
import { EnchCtor, EnchTypeData } from "@/src/Enchantment/EnchInterface";
import { Flag, JM, Spell } from "@sosarciel-cdda/schema";
import { createEnchLvlData, genEnchInfo, genEnchPrefix, genWieldTrigger } from "../UtilGener";
import { RarityPoints, RarityWeight } from "../../Define";

const list = [
    ["heat"     ,"火焰"],
    ["acid"     ,"酸液"],
    ["electric" ,"电击"],
    ["cold"     ,"寒冷"],
]

export const ElementalStrike = {
    id:"ElementalStrike",
    ctor:dm=>{
        //构造变体
        const {data,instance} = createEnchLvlData(list.length,idx=>{
            const [elid,elname] = list[idx];
            const name = `${elname}打击`;

            const dmgVar = `${ElementalStrike.id}_${elid}_dmg`;
            const tspell:Spell = {
                id:EMDef.genSpellID(`${ElementalStrike.id}_${elid}_Trigger`),
                type:"SPELL",
                flags:[...CON_SPELL_FLAG.filter(f=>f!="NO_EXPLOSION_SFX")],
                min_damage:{math:[dmgVar]},
                max_damage:{math:[dmgVar]},
                damage_type:elid,
                effect:"attack",
                shape:"blast",
                valid_targets:["hostile"],
                name:`${name} 附魔触发法术`,
                description: `${name} 附魔触发法术`
            }
            //变体ID
            const ench:Flag = {
                type:"json_flag", name,
                id: EMDef.genFlagID(`${ElementalStrike.id}_${elid}_Ench`),
                info:genEnchInfo('good',name,`这件物品可以额外造成 30% 的 ${elname} 伤害`),
                item_prefix:genEnchPrefix('good',name),
            };
            const teoc = genWieldTrigger(dm,ench.id,"TryMeleeAttack",[
                {
                    u_run_inv_eocs:"all",
                    search_data:[{wielded_only:true}],
                    true_eocs:{
                        eoc_type:"ACTIVATION",
                        id:EMDef.genEocID(`${ElementalStrike.id}_${elid}_WieldTigger_Sub`),
                        effect:[{math:[dmgVar,'=',`round(${JM.meleeDamage('n',"'ALL'")} * 0.3)`]}]
                    }
                },
                {npc_location_variable:{context_val:`${ElementalStrike.id}_loc`}},
                {u_cast_spell:{id:tspell.id},loc:{context_val:`${ElementalStrike.id}_loc`}}
            ])
            return {
                instance:{ ench,
                    weight:RarityWeight.Rare/list.length,
                    point :RarityPoints.Rare
                },
                data:[tspell,ench,teoc]
            }
        });

        //构造附魔集
        const enchData:EnchTypeData={
            id:ElementalStrike.id, instance,
            category:["weapons"],
            conflicts:["Elemental"],
        };

        dm.addData([...data],"ench",ElementalStrike.id);
        return enchData;
    }
} satisfies EnchCtor;