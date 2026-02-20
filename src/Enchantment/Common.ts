import { DataManager } from "@sosarciel-cdda/event";
import { EffectActiveCondList, EffectActiveCondSearchDataMap, EnchData, EnchTypeSearchDataMap, VaildEnchType, VaildEnchTypeList } from "./EnchInterface";
import { JObject } from "@zwa73/utils";
import { EMDef } from "@src/EMDefine";
import { BoolExpr, EocEffect, EocID, Flag, NumberExpr } from "@sosarciel-cdda/schema";
import { COMPLETE_ENCH_INIT, ENCH_EMPTY_IN, ENCH_ONE_IN, ENCH_POINT_CUR, ENCH_POINT_MAX, enchInsVar, IDENTIFY_EOC_ID, INIT_ENCH_DATA_EOC_ID, IS_CURSED_FLAG_ID, IS_ENCHED_FLAG_ID, IS_IDENTIFYED_FLAG_ID, ITEM_ENCH_TYPE, MAX_ENCH_COUNT, MAX_ENCH_POINT, operaEID, REMOVE_CURSE_EOC_ID, UPGRADE_ENCH_CACHE_EOC_ID } from "./Define";


export async function buildCommon(dm:DataManager,enchDataList:EnchData[]) {
    const out:JObject[]=[
        ... buildOperaEoc(enchDataList)          ,//辅助eoc
        ... buildIdentifyEoc(enchDataList)       ,//鉴定附魔Eoc
        ... buildRemoveCurseEoc(enchDataList)    ,//移除诅咒
        ... buildInitEnchDataEoc(enchDataList)   ,//初始化附魔数据
    ];

    //清理附魔缓存
    const clearCacheEoc = EMDef.genActEoc("ClearEnchCache",
        enchDataList.map((ench)=>({math:[enchInsVar(ench,"u"),"=","0"]}))
    );
    out.push(clearCacheEoc);

    //刷新附魔缓存eoc
    const upgradeEnchCache = EMDef.genActEoc(UPGRADE_ENCH_CACHE_EOC_ID,[
        {run_eocs:clearCacheEoc.id},
        //遍历生效条件
        ...EffectActiveCondList.map((cond)=>{
            const eff:EocEffect = {
                u_run_inv_eocs:"all",
                search_data:EffectActiveCondSearchDataMap[cond],
                true_eocs:{
                    eoc_type:"ACTIVATION",
                    id:EMDef.genEocID(`SumEnchCache_${cond}`),
                    effect:[
                        //遍历附魔
                        ...enchDataList.map((ench)=>
                            ench.lvl.map((lvlobj)=>{
                                const activeCond = ench.effect_active_cond??[...EffectActiveCondList];
                                if(lvlobj.intensity!=null && activeCond.includes(cond)){
                                    const seff:EocEffect = {
                                        if:{npc_has_flag:lvlobj.ench.id},
                                        then:[{math:[enchInsVar(ench,"u"),"+=",`${lvlobj.intensity}`]}]
                                    }
                                    return seff;
                                }
                                return undefined as any as EocEffect;
                            }).filter((e)=>e!==undefined)).flat()
                    ]
                }
            }
            return eff;
        })
    ],undefined,true);
    dm.addInvokeEoc("WearItem"    ,1,upgradeEnchCache);
    dm.addInvokeEoc("WieldItemRaw",1,upgradeEnchCache);
    dm.addInvokeEoc("SlowUpdate"  ,1,upgradeEnchCache);
    out.push(upgradeEnchCache);

    //根据缓存添加效果
    enchDataList.forEach((ench)=>{
        if(ench.intensity_effect!=null){
            const eids = ench.intensity_effect;
            //触发eoc
            const teoc = EMDef.genActEoc(`${ench.id}_AddEffect`,[
                {if:{math:[enchInsVar(ench,"u"),">=","1"]},
                then:[
                    //{u_message:ench.id},
                    ...eids.map(eid=>({u_add_effect:eid,intensity:{math:[enchInsVar(ench,"u")]},duration:"PERMANENT"})satisfies EocEffect)
                ],
                else:[...eids.map((eid)=>{
                    const eff:EocEffect={u_lose_effect:eid};
                    return eff;
                })]}
            ]);
            dm.addInvokeEoc("WearItem"    ,0,teoc);
            dm.addInvokeEoc("WieldItemRaw",0,teoc);
            dm.addInvokeEoc("SlowUpdate"  ,0,teoc);
            out.push(teoc);
        }
    })

    //鉴定使用的物品 物品为 beta
    const identifyWear = EMDef.genActEoc("IdentifyEnch_Use",[
        {run_eocs:[INIT_ENCH_DATA_EOC_ID,IDENTIFY_EOC_ID]},
    ],{not:{npc_has_flag:IS_IDENTIFYED_FLAG_ID}})
    dm.addInvokeEoc("WearItem" ,2,identifyWear);
    dm.addInvokeEoc("WieldItem",2,identifyWear);
    //dm.addInvokeEoc("EatItem"  ,2,identifyWear);
    out.push(identifyWear);

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
function buildOperaEoc(enchDataList:EnchData[]){
    //辅助eoc
    //添加附魔子eoc
    const addeocList = enchDataList.map(data=>
        data.lvl.map(lvlobj=>
            EMDef.genActEoc(operaEID(lvlobj.ench,"add"),[
                //添加等级变体flag与主flag
                {npc_set_flag:lvlobj.ench.id},
                {npc_set_flag:data.main.id},
                //如果是诅咒的则加上诅咒flag
                ... (data.is_curse ? [{npc_set_flag:IS_CURSED_FLAG_ID}]:[]),
                //增加附魔点数
                {math:[`n_${ENCH_POINT_CUR}`,"+=",`${lvlobj.point}`]},
                //添加附魔数据定义的副作用
                ...data.add_effects??[],
                ...lvlobj.add_effects??[],
            ],{and:[
                //排除冲突
                {not:{or:[
                    //排除任何冲突flag
                    ...(lvlobj.ench.conflicts??[]).map(id=>({npc_has_flag:id})),
                    //排除自身
                    {npc_has_flag:lvlobj.ench.id},
                ]}},
                //物品cate应被附魔cate包含
                {or:data.ench_type.map(t=>({compare_string:[{npc_val:ITEM_ENCH_TYPE}, t]}))},
                //排除自体护甲与生化武器
                {not:{or:[
                    {npc_has_flag:"BIONIC_WEAPON"   },//生化武器
                    {npc_has_flag:"INTEGRATED"      },//自体护甲
                ]}}
            ]},true)
        )
    ).flat();

    //{not:{npc_has_flag:enchset.main.id}}
    //移除附魔子eoc 不会移除 被诅咒 IS_CURSED_FLAG_ID flag
    const removeeocList = enchDataList.map(data=>
        data.lvl.map(lvlobj=>
            EMDef.genActEoc(operaEID(lvlobj.ench,"remove"),[
                //添加移除变体flag与主flag
                {npc_unset_flag:lvlobj.ench.id},
                {npc_unset_flag:data.main.id},
                //添加附魔数据定义的副作用
                ...data.remove_effects??[],
                ...lvlobj.remove_effects??[],
            ],{npc_has_flag:lvlobj.ench.id},true)
        )
    ).flat();

    return [
        ...addeocList,
        ...removeeocList
    ];
}

/**生成鉴定eoc */
function buildIdentifyEoc(enchDataList:EnchData[]){
    //总附魔权重
    const weightSum = enchDataList.reduce((enchsum,ench)=>
        enchsum + ench.lvl.reduce((lvlobjsum,lvlobj)=>
            (lvlobj.weight ?? 0) + lvlobjsum, 0), 0);
    //空附魔权重
    const noneWeight  = weightSum/ENCH_EMPTY_IN;
    //空附魔Eoc
    const noneEnchEoc = EMDef.genActEoc("NoneEnch",[]);

    //根据随机权重生成 附魔类别 : weight_list_eoc数据 表单
    const weightListMap:Record<VaildEnchType,[EocID,NumberExpr][]> = {} as any;
    //初始化表单数组
    VaildEnchTypeList.forEach(et=>weightListMap[et]=[]);
    //遍历附魔类别与附魔数据表
    for(const enchCate of VaildEnchTypeList){
        enchDataList.forEach((ench)=>{
            const wlist = weightListMap[enchCate];
            if(ench.ench_type.includes(enchCate)){
                //将辅助eoc加入表单
                ench.lvl.forEach(lvlobj=>
                    wlist.push([operaEID(lvlobj.ench,"add"),{math:[`${(lvlobj.weight ?? 0)}`]}]))
                //将空eoc加入表单
                wlist.push([noneEnchEoc.id,{math:[`${noneWeight}`]}]);
            }
        })
    }

    //鉴定条件
    const identifyCond:BoolExpr = {and:[
        //物品没有完成鉴定flag
        {not:{npc_has_flag:IS_IDENTIFYED_FLAG_ID}},
        //物品完成初始化
        {math:[`n_${COMPLETE_ENCH_INIT}`,"==",'1']},
        //物品cate等同于附魔cate
        {or:VaildEnchTypeList.map(cate=>({compare_string:[{npc_val:ITEM_ENCH_TYPE}, cate]}))},
    ]}

    //附魔子eoc
    const subeocid = EMDef.genEocID('IdentifyEnch_each');
    //鉴定主EOC
    const identifyEnchEoc = EMDef.genActEoc(IDENTIFY_EOC_ID,[
        //如果命中附魔生成概率
        {if:{one_in_chance:ENCH_ONE_IN},
        then:[
            {math:["_eachCount","=",`${MAX_ENCH_COUNT}`]},
            //为每个附魔cate创建eoc 通过 identifyCond 排除不同cate的物品
            ...(VaildEnchTypeList.map(cate=>{
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
    ],identifyCond,true);

    return [identifyEnchEoc,noneEnchEoc];
}

/**生成移除诅咒eoc */
function buildRemoveCurseEoc(enchDataList:EnchData[]){
    //移除诅咒flag 同时遍历附魔list 移除所有 is_curse 的 附魔
    const removeCurseEffects:EocEffect[] = [{npc_unset_flag:IS_CURSED_FLAG_ID}];
    enchDataList.forEach((ench)=>{
        if(ench.is_curse==true)
            removeCurseEffects.push(...ench.lvl.map(lvlobj=>({run_eocs:operaEID(lvlobj.ench,"remove")})))
    });
    const removeCurse = EMDef.genActEoc(REMOVE_CURSE_EOC_ID,[...removeCurseEffects],undefined,true);
    return [removeCurse];
}
/**生成初始化附魔数据eoc */
function buildInitEnchDataEoc(enchDataList:EnchData[]){
    //依靠 EnchTypeSearchDataMap 内的 cate->search_data 映射
    //将 cate 字符串烘焙至 n_ITEM_ENCH_TYPE 以便处理
    const initeffects:EocEffect[] = VaildEnchTypeList.map(t=>({
        u_run_inv_eocs:"all",
        search_data:[...EnchTypeSearchDataMap[t]],
        true_eocs:{
            id:EMDef.genEocID(`initEnchData_${t}`),
            eoc_type:"ACTIVATION",
            effect:[
                {npc_add_var:ITEM_ENCH_TYPE,value:t},
                {math:[`n_${ENCH_POINT_MAX}`,"=",`${MAX_ENCH_POINT}`]},
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

