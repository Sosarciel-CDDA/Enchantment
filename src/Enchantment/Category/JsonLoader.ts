import { DATA_DIR } from '@/src/EMDefine';
import { DataManager } from '@sosarciel-cdda/event';
import { UtilFT } from '@zwa73/utils';
import path from 'pathe';
import { EnchInsData } from '../EnchInterface.schema';
import { pushConflictsKey } from './CategoryBuilder';

const EnchDir = path.join(DATA_DIR,'Enchantment');
export const loadJsonEnch = async (dm:DataManager)=>{
    const enchFileList = await UtilFT.fileSearchRegex(EnchDir,'**/*.{json,json5}');
    const result = await Promise.all(enchFileList.map(async filepath=>{
        return await UtilFT.loadJSONFile<EnchInsData[]>(filepath,{json5:true});
    })).then(v=>v.flat());
    pushConflictsKey(...result);
    return result;
}