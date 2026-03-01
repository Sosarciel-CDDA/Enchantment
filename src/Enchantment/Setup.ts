import { Eoc, JM } from "@sosarciel-cdda/schema";
import { EMDef } from "../EMDefine";
import { ENCH_CHANGE, MAX_ENCH_COUNT, MAX_PREFIX_ENCH_COUNT, MAX_SUFFIX_ENCH_COUNT, MAX_HIDE_ENCH_COUNT, RareEnum } from "./Define";
import { DataManager, setupCtor } from "@sosarciel-cdda/event";
import { RemoveCurseSpellID } from "./RemoveCurseSpell";
import { IdentifySpellID } from "./IdentifySpell";



//#region 初始化
const setuplist = setupCtor({
    table:[
        {var:ENCH_CHANGE            ,desc:'附魔物品的生成几率, 100为100%',def:'10' },
        {var:MAX_ENCH_COUNT         ,desc:'附魔物品生成时的尝试次数, 越高越容易充满点数',def:'10' },
        {var:MAX_PREFIX_ENCH_COUNT  ,desc:'最大前缀附魔数量',def:'1' },
        {var:MAX_SUFFIX_ENCH_COUNT  ,desc:'最大后缀附魔数量',def:'1' },
        {var:MAX_HIDE_ENCH_COUNT    ,desc:'最大隐含附魔数量',def:'2' },
        {var:RareEnum.Magic.pointVar   ,desc:'[魔法物品]等级生成时的最大附魔容量',def:'100'},
        {var:RareEnum.Epic.pointVar    ,desc:'[奇迹物品]等级生成时的最大附魔容量',def:'150'},
        {var:RareEnum.Randart.pointVar ,desc:'[神话物品]等级生成时的最大附魔容量',def:'200'},
        {var:RareEnum.Magic.weightVar  ,desc:'[魔法物品]等级的生成权重',def:'400'},
        {var:RareEnum.Epic.weightVar   ,desc:'[奇迹物品]等级的生成权重',def:'200'},
        {var:RareEnum.Randart.weightVar,desc:'[神话物品]等级的生成权重',def:'100'},
    ],
    prefix:EMDef.MOD_PREFIX,
    message:'对附魔的功能进行设置',
    menuName:'附魔设置',
});
const initEoc:Eoc = {
    id:EMDef.genEocID(`Init`),
    type:"effect_on_condition",
    eoc_type:"ACTIVATION",
    effect:[
        {math:[JM.spellLevel('u',`'${RemoveCurseSpellID}'`),'=','0']},
        {math:[JM.spellLevel('u',`'${IdentifySpellID}'`),'=','0']},
    ],
}
//#endregion


export const buildSetup = (dm:DataManager)=>{
    dm.addInvokeID('GameStart',0,initEoc.id);
    dm.addData([initEoc,...setuplist],'Setup');
}