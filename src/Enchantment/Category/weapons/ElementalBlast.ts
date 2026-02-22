import { CON_SPELL_FLAG, EMDef } from "@/src/EMDefine";
import { EnchCtor } from "@/src/Enchantment/EnchInterface";
import { Flag, JM, Spell } from "@sosarciel-cdda/schema";
import { createEnchLvlData, genEnchInfo, genEnchPrefix, genWieldTrigger } from "../UtilGener";
import { RarityPoints, RarityWeight } from "../../Define";

const list = [
    ["heat"     ,"火焰"],
    ["acid"     ,"酸液"],
    ["electric" ,"电击"],
    ["cold"     ,"寒冷"],
]

export const ElementalBlast = {
    id:"ElementalBlast",
    ctor:dm=>{
        //构造变体
        const {data,instance} = createEnchLvlData(list.length,idx=>{
            const [elid,elname] = list[idx];
            const name = `${elname}爆发`;

            const dmgVar = `${ElementalBlast.id}_${elid}_dmg`;
            const tspell:Spell = {
                id:EMDef.genSpellID(`${ElementalBlast.id}_${elid}_Trigger`),
                type:"SPELL",
                flags:[...CON_SPELL_FLAG.filter(f=>f!="NO_EXPLOSION_SFX")],
                min_damage:{math:[dmgVar]},
                max_damage:{math:[dmgVar]},
                damage_type:elid,
                min_aoe:1,
                max_aoe:1,
                effect:"attack",
                shape:"blast",
                valid_targets:["hostile","ground"],
                name:`${name} 附魔触发法术`,
                description: `${name} 附魔触发法术`
            }
            //变体ID
            const flag:Flag = {
                type:"json_flag", name,
                id: EMDef.genFlagID(`${ElementalBlast.id}_${elid}_Ench`),
                info:genEnchInfo('good',name,`这件物品可以额外造成 20% 的范围 ${elname} 伤害`),
                item_prefix:genEnchPrefix('good',name),
            };
            const teoc = genWieldTrigger(dm,flag.id,"TryMeleeAttack",[
                {
                    u_run_inv_eocs:"all",
                    search_data:[{wielded_only:true}],
                    true_eocs:{
                        eoc_type:"ACTIVATION",
                        id:EMDef.genEocID(`${ElementalBlast.id}_${elid}_WieldTigger_Sub`),
                        effect:[{math:[dmgVar,'=',`round(${JM.meleeDamage('n',"'ALL'")} * 0.2)`]}]
                    }
                },
                {npc_location_variable:{context_val:`${ElementalBlast.id}_loc`}},
                {u_cast_spell:{id:tspell.id},loc:{context_val:`${ElementalBlast.id}_loc`}}
            ])
            return {
                instance:{
                    id:ElementalBlast.id, flag,
                    category:["weapons"],
                    conflicts:["Elemental"],
                    weight:RarityWeight.Uncommon/list.length,
                    point :RarityPoints.Basic
                },
                data:[tspell,flag,teoc]
            }
        });

        dm.addData([...data],"ench",ElementalBlast.id);
        return instance;
    }
} satisfies EnchCtor;