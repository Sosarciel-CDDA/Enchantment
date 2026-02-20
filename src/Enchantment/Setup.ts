import { Eoc, JM, Mutation, TalkTopic } from "@sosarciel-cdda/schema";
import { EMDef } from "../EMDefine";
import { ENCH_CHANGE, MAX_ENCH_COUNT, MAX_ENCH_POINT } from "./Define";
import { DataManager } from "@sosarciel-cdda/event";



//#region 初始化
const defSetupEoc:Eoc = {
    id:EMDef.genEocID(`DefaultSetup`),
    type:"effect_on_condition",
    eoc_type:"ACTIVATION",
    effect:[
        { math:[ENCH_CHANGE    ,'=',`10` ] },
        { math:[MAX_ENCH_COUNT ,'=',`10` ] },
        { math:[MAX_ENCH_POINT ,'=',`100`] },
    ]
}
const customSetupEoc:Eoc = {
    id:EMDef.genEocID(`CustomSetup`),
    type:"effect_on_condition",
    eoc_type:"ACTIVATION",
    effect:[
        { math:[ENCH_CHANGE    ,'=',JM.numInput(`'ENCH_CHANGE 附魔物品的生成几率, 100为100%'`,10)] },
        { math:[MAX_ENCH_POINT ,'=',JM.numInput("'MAX_ENCH_POINT 附魔物品生成时的最大点数, 越高则附魔强度越高'",100)] },
        { math:[MAX_ENCH_COUNT ,'=',JM.numInput(`'MAX_ENCH_COUNT 附魔物品生成时的尝试次数, 越高越容易充满 MAX_ENCH_POINT'`,10)] },
    ]
}
const setMutId = EMDef.genMutationID(`Setup`);
const setupTopic = {
    id:EMDef.genTalkTopicID(`SetupTopic`),
    type:'talk_topic',
    dynamic_line:
        `&对附魔的功能进行设置 当前:\n` +
        `${ENCH_CHANGE} : <global_val:${ENCH_CHANGE}>\n` +
        `${MAX_ENCH_POINT} : <global_val:${MAX_ENCH_POINT}>\n` +
        `${MAX_ENCH_COUNT} : <global_val:${MAX_ENCH_COUNT}>`,
    responses:[
        {topic: "TALK_DONE",text:"不做改变",condition:{u_has_trait:setMutId}},
        {topic: "TALK_DONE",text:"使用默认设置",effect:{run_eocs:[defSetupEoc.id]}},
        {topic: "TALK_DONE",text:"自定义设置",effect:{run_eocs:[customSetupEoc.id]}},
    ]
} satisfies TalkTopic;
const openSettingEoc:Eoc = {
    id:EMDef.genEocID(`OpenSetting`),
    type:"effect_on_condition",
    eoc_type:"ACTIVATION",
    effect:[{open_dialogue:{topic:setupTopic.id}}]
}
const setupMut: Mutation = {
    id: setMutId,
    type: "mutation",
    name: `附魔设置`,
    description: `附魔设置`,
    points: 0, purifiable: false, valid: false, active: true,
    activated_eocs: [openSettingEoc.id],
};
const setupEoc:Eoc = {
    id:EMDef.genEocID(`Setup`),
    type:"effect_on_condition",
    eoc_type:"RECURRING",
    recurrence:1,
    global:true,
    run_for_npcs:false,
    condition:{and:['u_is_avatar',{not:{u_has_trait:setMutId}}]},
    deactivate_condition:{or:[{u_has_trait:setMutId},{not:'u_is_avatar'}]},
    effect:[
        { run_eocs:[openSettingEoc.id] },
        { u_add_trait:setMutId },
    ],
}
//#endregion


export const buildSetup = (dm:DataManager)=>{
    dm.addData([defSetupEoc,customSetupEoc,setupTopic,openSettingEoc,setupMut,setupEoc],'Setup');
}