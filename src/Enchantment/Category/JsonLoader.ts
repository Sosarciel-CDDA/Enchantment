import { DATA_DIR } from '@/src/EMDefine';
import { DataManager } from '@sosarciel-cdda/event';
import { JObject, UtilFT } from '@zwa73/utils';
import path from 'pathe';
import { EnchInsData } from '../EnchInterface.schema';
import { pushConflictsKey } from './CategoryBuilder';

const EnchDir = path.join(DATA_DIR,'Enchantment');
export const loadJsonEnch = async (dm:DataManager)=>{
    const enchFileList = await UtilFT.fileSearchRegex(EnchDir,'**/*.{json,json5}');
    const result = await Promise.all(enchFileList.map(async filepath=>{
        const data = await UtilFT.loadJSONFile<JObject[]>(filepath,{json5:true});
        const parsed = path.parse(path.relative(DATA_DIR,filepath));
        dm.addData(data.filter(v=>v.type!='CustomEnch'),'JsonEnch',parsed.dir,parsed.name);
        return data.filter(v=>v.type=='CustomEnch') as EnchInsData[];
    })).then(v=>v.flat());
    pushConflictsKey(...result);
    return result;
}