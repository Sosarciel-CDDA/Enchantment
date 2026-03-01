import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'pathe';
import { DATA_DIR, EMDef } from '../EMDefine';
import { Eoc, EocEffect, InlineEoc } from '@sosarciel-cdda/schema';
import { DataManager } from '@sosarciel-cdda/event';
import { AliasResult, CREATE_ALIAS_EOC_ID } from './Define';



/**纯粹的 Promise 封装版本 csv-parse
 * @param csvContent CSV 字符串内容
 * @returns 返回一个解析后的对象数组 Promise
 */
const parseCsvPromise = <T = any>(csvContent: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        parse(
            csvContent,
            {
                columns: true, // 自动将第一行映射为 key
                skip_empty_lines: true, // 跳过纯空行
                trim: true, // 自动修剪字段首尾空格
                relax_column_count: true, // 增加容错，允许列数不一致
            },
            (err, records: any) => {
                if (err) {
                    return reject(err);
                }
                resolve(records);
            },
        );
    });
};


/**解析混合规则，返回规则数组和总权重 */
const parsePatterns = (patternContent: string) => {
    const patterns: { weight: number; rule: string }[] = [];
    let totalWeight = 0;

    const lines = patternContent.trim().split('\n').map(line => line.trim());

    for (const line of lines) {
        if (!line) continue;
        const [weightStr, rule] = line.split(',');
        if (!weightStr || !rule) continue;

        const weight = parseInt(weightStr, 10);

        patterns.push({ weight, rule });
        totalWeight += weight;
    }

    return { patterns, totalWeight };
};

const AliasTemp = "AliasTemp";
const AliasConcatTempX = (x:number)=> `_AliasTemp_${x}`;

export const buildAlias = async (dm:DataManager)=>{
    const csvtxt     = await fs.promises.readFile(path.join(DATA_DIR,'Alias.csv'),'utf-8');
    const csvtable   = await parseCsvPromise<Record<string,string>>(csvtxt);
    const patterntxt = await fs.promises.readFile(path.join(DATA_DIR,'Alias_mix.txt'),'utf-8');
    const {patterns,totalWeight} = parsePatterns(patterntxt);

    const csvSetTable:Record<string,Set<string>> = {};
    for(const row of csvtable){
        for(const key in row){
            const value = row[key];
            if(value==null || value=="") continue;
            csvSetTable[key] ??= new Set();
            csvSetTable[key].add(value);
        }
    }

    const aliasTypeEocId = (cate:string)=>EMDef.genEocID(`AliasType_${cate}`)

    const aliasList = Object.entries(csvSetTable)
        .map(([k,v])=>({key:k,value:Array.from(v)}));

    //为每一类alias词创建随机生成eoc
    const aliasTypeEocList = aliasList.map(obj=>({
            id:aliasTypeEocId(obj.key),
            type:"effect_on_condition",
            eoc_type:"ACTIVATION",
            effect:[{set_string_var:obj.value,target_var:{global_val:AliasTemp}}]
        })satisfies Eoc);

    const aliasACateEocIdList = aliasList.filter(obj=>/a/.test(obj.key)).map(obj=>aliasTypeEocId(obj.key));

    const aliasNCateEocIdList = aliasList.filter(obj=>/n/.test(obj.key)).map(obj=>aliasTypeEocId(obj.key));

    const aliasACateEoc:Eoc = {
        id:EMDef.genEocID(`AliasCate_A`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[{weighted_list_eocs:aliasACateEocIdList.map(id=>[id,1])}]
    }

    const aliasNCateEoc:Eoc = {
        id:EMDef.genEocID(`AliasCate_N`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[{weighted_list_eocs:aliasNCateEocIdList.map(id=>[id,1])}]
    }

    const aliasEoc:Eoc = {
        id:CREATE_ALIAS_EOC_ID,
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[{weighted_list_eocs:patterns.map(({weight,rule},idx)=>{
            const tokens = rule.toLocaleLowerCase().split('+');
            const rollEff:EocEffect[] = tokens.flatMap((t,tidx)=>{
                if(!/(n|a)\d?/.test(t))
                    return [{ set_string_var:t,target_var:{global_val:AliasConcatTempX(tidx)}}] satisfies EocEffect[];
                const eid =
                    t=='n' ? aliasNCateEoc.id :
                    t=='a' ? aliasACateEoc.id :
                    aliasTypeEocId(t);
                return [
                    {run_eocs:[eid]} satisfies EocEffect,
                    {set_string_var:`<global_val:${AliasTemp}>`,target_var:{global_val:AliasConcatTempX(tidx)},parse_tags:true} satisfies EocEffect,
                ] as EocEffect[];
            });
            const concatEff:EocEffect = {
                set_string_var:tokens.map((_,tidx)=>`<global_val:${AliasConcatTempX(tidx)}>`).join(''),
                target_var:{global_val:AliasResult},
                parse_tags:true,
            }

            return [
            {
                id:EMDef.genEocID(`AliasPattern_${idx}`),
                eoc_type:"ACTIVATION",
                effect:[...rollEff,concatEff]
            } satisfies InlineEoc,
            weight] satisfies [InlineEoc,number];
        })}]
    }

    dm.addData([...aliasTypeEocList,aliasACateEoc,aliasNCateEoc,aliasEoc],'Alias');
};