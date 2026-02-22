import { DataManager } from "@sosarciel-cdda/event";
import { EffectActiveCondList, EffectActiveCondSearchDataMap, EnchInsData, EnchTypeSearchDataMap, VaildEnchCategory, VaildEnchCategoryList } from "./EnchInterface";
import { JObject } from "@zwa73/utils";
import { EMDef } from "@/src/EMDefine";
import { Eoc, EocEffect, EocID, Flag, NumberExpr } from "@sosarciel-cdda/schema";
import { COMPLETE_ENCH_INIT, ENCH_EMPTY_IN, ENCH_CHANGE, ENCH_POINT_CUR, ENCH_POINT_MAX, enchInsVar, IDENTIFY_EOC_ID, INIT_ENCH_DATA_EOC_ID, IS_CURSED_FLAG_ID, IS_ENCHED_FLAG_ID, IS_IDENTIFYED_FLAG_ID, ITEM_ENCH_TYPE, MAX_ENCH_COUNT, BASE_ENCH_POINT, operaEID, REMOVE_CURSE_EOC_ID, UPGRADE_ENCH_CACHE_EOC_ID, RAND_ENCH_POINT, formatArray } from "./Define";
import { getEnchConflictsExpr } from "./Category";


export async function buildCommon(dm:DataManager,enchDataList:EnchInsData[]) {
    const out:JObject[]=[
        ... buildOperaEoc(enchDataList)          ,//辅助eoc
        ... buildIdentifyEoc(enchDataList)       ,//鉴定附魔Eoc
        ... buildRemoveCurseEoc(enchDataList)    ,//移除诅咒
        ... buildInitEnchDataEoc(enchDataList)   ,//初始化附魔数据
    ];

    //清理附魔缓存
    const clearCacheEoc = EMDef.genActEoc("ClearEnchCache",
        enchDataList.flatMap(ench=>formatArray(ench.intensity).map(ins=>({math:[enchInsVar(ins,"u"),"=","0"]})satisfies EocEffect))
    );
    out.push(clearCacheEoc);

    //刷新附魔缓存eoc
    const upgradeEnchCache:Eoc = {
        id:UPGRADE_ENCH_CACHE_EOC_ID,
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[
            {run_eocs:clearCacheEoc.id},
            //遍历生效条件
            ...EffectActiveCondList.map(cond=>({
                u_run_inv_eocs:"all",
                search_data:EffectActiveCondSearchDataMap[cond],
                true_eocs:{
                    eoc_type:"ACTIVATION",
                    id:EMDef.genEocID(`SumEnchCache_${cond}`),
                    effect:[
                        //遍历附魔
                        //排除无强度或非当前条件触发
                        ...enchDataList.filter(ins=>ins.intensity!=null && (ins.effect_active_cond==null || ins.effect_active_cond.includes(cond)))
                            .map(ins=>({
                                if:{npc_has_flag:ins.ench.id},
                                then:[...formatArray(ins.intensity).map(ins => ({math:[enchInsVar(ins,"u"),"+=",`${ins.value}`]}) satisfies EocEffect)]
                            }) satisfies EocEffect)]
                }
            }) satisfies EocEffect)
        ]
    };
    dm.addInvokeEoc("WearItem"    ,1,upgradeEnchCache);
    dm.addInvokeEoc("WieldItemRaw",1,upgradeEnchCache);
    dm.addInvokeEoc("SlowUpdate"  ,1,upgradeEnchCache);
    out.push(upgradeEnchCache);

    //根据缓存添加效果
    enchDataList
        .filter(ench=>ench.intensity!=null)
        .forEach(ench=>{
            const intensity = formatArray(ench.intensity)
            intensity.forEach(ins=>{
                //触发eoc
                const teoc = EMDef.genActEoc(`${ench.id}_UpdateEffect`,[
                    {if:{math:[enchInsVar(ins,"u"),">=","1"]},
                    then:[{u_add_effect:ins.id,intensity:{math:[enchInsVar(ins,"u")]},duration:"PERMANENT"}],
                    else:[{u_lose_effect:ins.id}]}
                ]);
                dm.addInvokeEoc("WearItem"    ,0,teoc);
                dm.addInvokeEoc("WieldItemRaw",0,teoc);
                dm.addInvokeEoc("SlowUpdate"  ,0,teoc);
                out.push(teoc);
            })
        });

    //鉴定使用的物品 物品为 beta
    const identifyWear = EMDef.genActEoc("IdentifyEnch_Use",[{run_eocs:[INIT_ENCH_DATA_EOC_ID,IDENTIFY_EOC_ID]}]);
    dm.addInvokeEoc("WearItem" ,2,identifyWear);
    dm.addInvokeEoc("WieldItem",2,identifyWear);
    out.push(identifyWear);

    //初始化鉴定已穿着的物品
    const identifyAuto:Eoc = {
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        id:EMDef.genEocID("IdentifyEnch_Init"),
        effect:[
            {run_eocs:[INIT_ENCH_DATA_EOC_ID]},
            ...EffectActiveCondList.map(cond=>({
                u_run_inv_eocs:"all",
                search_data:EffectActiveCondSearchDataMap[cond],
                true_eocs:[IDENTIFY_EOC_ID]
            }) satisfies EocEffect)
        ]
    };
    dm.addInvokeEoc("Init",2,identifyAuto);
    out.push(identifyAuto);
    //dm.addInvokeEoc("EatItem"  ,2,identifyWear);

    //共用flag
    //表示物品是被诅咒的flag
    const cursedFlag:Flag={
        type:"json_flag",
        id:IS_CURSED_FLAG_ID,
        name:"诅咒的",
        info:`<bad>[诅咒的]</bad> 这件物品含有诅咒`
    }
    //表示物品已鉴定过的flag
    const identedFlag:Flag={
        type:"json_flag",
        id:IS_IDENTIFYED_FLAG_ID,
        name:"完成鉴定",
        info:`<good>[完成鉴定]</good> 你已经了解了这件物品的详情`
    }
    //表示物品含有附魔属性的flag
    const enchedFlag:Flag={
        type:"json_flag",
        id:IS_ENCHED_FLAG_ID,
        name:"魔法物品",
        info:`<good>[魔法物品]</good> 这件物品被附魔了`
    }
    out.push(cursedFlag,identedFlag,enchedFlag);

    dm.addData(out,"Common");
}

/**生成辅助eoc */
function buildOperaEoc(enchDataList:EnchInsData[]){
    //辅助eoc
    //添加附魔子eoc
    const addeocList = enchDataList.map(ins=>
        EMDef.genActEoc(operaEID(ins.ench,"add"),[
            //添加等级变体flag与主flag
            {npc_set_flag:ins.ench.id},
            //如果是诅咒的则加上诅咒flag
            ... (ins.is_curse ? [{npc_set_flag:IS_CURSED_FLAG_ID}]:[]),
            //增加附魔点数
            {math:[`n_${ENCH_POINT_CUR}`,"+=",`${ins.point}`]},
            //添加附魔数据定义的副作用
            ...ins.add_effects??[],
        ],{and:[
            //排除冲突
            {not:getEnchConflictsExpr(ins)},
            //物品cate应被附魔cate包含
            {or:ins.category.map(t=>({compare_string:[{npc_val:ITEM_ENCH_TYPE}, t]}))},
            //排除自体护甲与生化武器
            {not:{or:[
                {npc_has_flag:"BIONIC_WEAPON"   },//生化武器
                {npc_has_flag:"INTEGRATED"      },//自体护甲
            ]}}
        ]},true)
    );

    //{not:{npc_has_flag:enchset.main.id}}
    //移除附魔子eoc
    //由于物品可能含有多个诅咒, 所以单一附魔移除不会移除 被诅咒 IS_CURSED_FLAG_ID flag
    const removeeocList = enchDataList.map(ins=>
        EMDef.genActEoc(operaEID(ins.ench,"remove"),[
            //添加移除变体flag
            {npc_unset_flag:ins.ench.id},
            //减少附魔点数
            {math:[`n_${ENCH_POINT_CUR}`,"-=",`${ins.point}`]},
            //添加附魔数据定义的副作用
            ...ins.remove_effects??[],
        ],{npc_has_flag:ins.ench.id},true)
    );

    return [
        ...addeocList,
        ...removeeocList
    ];
}

/**生成鉴定eoc */
function buildIdentifyEoc(enchDataList:EnchInsData[]){
    //空附魔Eoc
    const noneEnchEoc = EMDef.genActEoc("NoneEnch",[]);

    //根据随机权重生成 附魔类别 : weight_list_eoc数据 表单
    const weightListMap:Record<VaildEnchCategory,[EocID,NumberExpr][]> = {} as any;
    //遍历附魔类别与附魔数据表
    for(const cate of VaildEnchCategoryList){
        //cate下总附魔权重
        const weightSum = enchDataList
            .filter(v=>v.category.includes(cate))
            .reduce((enchsum,ench)=>enchsum + (ench.weight??0),0);

        //空附魔权重
        const noneWeight  = weightSum/ENCH_EMPTY_IN;
        //将空eoc加入表单
        weightListMap[cate] = [
            [noneEnchEoc.id,{math:[`${noneWeight}`]}],
            ... enchDataList //遍历所有附魔
                .filter(ench=>ench.category.includes(cate))
                .filter(ins=>(ins.weight??0)>0)
                .map(ins=>[operaEID(ins.ench,"add"),{math:[`${(ins.weight ?? 0)}`]}] satisfies [EocID,NumberExpr])
        ];
    }

    //附魔子eoc
    const subeocid = EMDef.genEocID('IdentifyEnch_each');
    //鉴定主EOC
    const identifyEnchEoc:Eoc = {
        id:IDENTIFY_EOC_ID,
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        condition:{and:[
            //物品没有完成鉴定flag
            {not:{npc_has_flag:IS_IDENTIFYED_FLAG_ID}},
            //物品完成初始化
            {math:[`n_${COMPLETE_ENCH_INIT}`,"==",'1']},
            //物品cate等同于任意一个附魔cate
            {or:VaildEnchCategoryList.map(cate=>({compare_string:[{npc_val:ITEM_ENCH_TYPE}, cate]}))},
        ]},
        effect:[
            //如果命中附魔生成概率
            {if:{x_in_y_chance:{x:{math:[`${ENCH_CHANGE}`]},y:100}},
            then:[
                {math:["_eachCount","=",`${MAX_ENCH_COUNT}`]},
                //为每个附魔cate创建eoc 通过 identifyCond 排除不同cate的物品
                ...(VaildEnchCategoryList.map(cate=>{
                    const eff:EocEffect = {run_eocs:{
                        id:`${subeocid}_${cate}` as EocID,
                        eoc_type:"ACTIVATION",
                        effect:[
                            {weighted_list_eocs:weightListMap[cate]},
                            {math:["_eachCount","-=","1"]},
                            {run_eocs:`${subeocid}_${cate}` as EocID}
                        ],
                        condition:{and:[
                            {math:["_eachCount",">",`0`]},
                            {math:[`n_${ENCH_POINT_CUR}`,"<",`n_${ENCH_POINT_MAX}`]}
                        ]}
                    }}
                    return eff;
                })),
                {u_message:"你从一件装备上发现了附魔",type:"good"},
                {npc_set_flag:IS_ENCHED_FLAG_ID},
            ]},
            {u_message:"一件装备的详细属性被揭示了",type:"good"},
            {npc_set_flag:IS_IDENTIFYED_FLAG_ID},
        ]
    }

    return [identifyEnchEoc,noneEnchEoc];
}

/**生成移除诅咒eoc */
function buildRemoveCurseEoc(enchDataList:EnchInsData[]){
    //移除诅咒flag 同时遍历附魔list 移除所有 is_curse 的 附魔
    const removeCurseEffects:EocEffect[] = [{npc_unset_flag:IS_CURSED_FLAG_ID}];
    enchDataList.forEach(ins=>{
        if(ins.is_curse==true)
            removeCurseEffects.push({run_eocs:operaEID(ins.ench,"remove")})
    });
    const removeCurse = EMDef.genActEoc(REMOVE_CURSE_EOC_ID,[...removeCurseEffects],undefined,true);
    return [removeCurse];
}
/**生成初始化附魔数据eoc */
function buildInitEnchDataEoc(enchDataList:EnchInsData[]){
    //依靠 EnchTypeSearchDataMap 内的 cate->search_data 映射
    //将 cate 字符串烘焙至 n_ITEM_ENCH_TYPE 以便处理
    const initeffects:EocEffect[] = VaildEnchCategoryList.map(t=>({
        u_run_inv_eocs:"all",
        search_data:[...EnchTypeSearchDataMap[t]],
        true_eocs:{
            id:EMDef.genEocID(`initEnchData_${t}`),
            eoc_type:"ACTIVATION",
            effect:[
                {npc_add_var:ITEM_ENCH_TYPE,value:t},
                {math:[`n_${ENCH_POINT_MAX}`,"=",`${BASE_ENCH_POINT} + rand(${RAND_ENCH_POINT})`]},
                {math:[`n_${COMPLETE_ENCH_INIT}`,"=",'1']}
            ],
            condition:{math:[`n_${COMPLETE_ENCH_INIT}`,"!=",'1']}
        }
    }))
    const initEnchData = EMDef.genActEoc(INIT_ENCH_DATA_EOC_ID,[
        ...initeffects
    ],undefined,true);
    return [initEnchData];
}

