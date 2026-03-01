import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'pathe';
import { DATA_DIR } from '../EMDefine';
// ================= 类型定义 =================

type Pattern = {
    weight: number;
    tokens: string[];
};

type ParsedPatterns = {
    patterns: Pattern[];
    totalWeight: number;
};

type Vocabulary = {
    nouns: string[];
    adjectives: string[];
};

// ================= 纯函数实现 =================

/**解析 CSV 词库，返回包含名词和形容词的对象 */
const parseCsvVocabulary = (csvContent: string): Vocabulary => {
    const nouns: string[] = [];
    const adjectives: string[] = [];
    const lines = csvContent.trim().split('\n').map(line => line.trim());

    if (lines.length === 0) return { nouns, adjectives };

    const headers = lines[0].split(',').map(h => h.trim());
    const nounIndices = headers.map((h, i) => /^n\d+$/i.test(h) ? i : -1).filter(i => i !== -1);
    const adjIndices = headers.map((h, i) => /^a\d+$/i.test(h) ? i : -1).filter(i => i !== -1);

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < headers.length || cols.every(c => c === '')) continue;

        nounIndices.forEach(idx => {
            if (cols[idx]) nouns.push(cols[idx]);
        });

        adjIndices.forEach(idx => {
            if (cols[idx]) adjectives.push(cols[idx]);
        });
    }

    return { nouns, adjectives };
};

/**解析混合规则，返回规则数组和总权重 */
const parsePatterns = (patternContent: string): ParsedPatterns => {
    const patterns: Pattern[] = [];
    let totalWeight = 0;

    const lines = patternContent.trim().split('\n').map(line => line.trim());

    for (const line of lines) {
        if (!line) continue;
        const [weightStr, ruleStr] = line.split(',');
        if (!weightStr || !ruleStr) continue;

        const weight = parseInt(weightStr, 10);
        const tokens = ruleStr.split('+').map(t => t.trim());

        patterns.push({ weight, tokens });
        totalWeight += weight;
    }

    return { patterns, totalWeight };
};

/**工具函数：从数组中随机抽取一个元素 */
const getRandomItem = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**核心逻辑：基于词库和规则生成一个 Alias */
const generateAlias = (vocab: Vocabulary, rules: ParsedPatterns): string => {
    const { nouns, adjectives } = vocab;
    const { patterns, totalWeight } = rules;

    if (patterns.length === 0) throw new Error("规则池为空");
    if (nouns.length === 0) throw new Error("名词词库为空");

    // 1. 根据权重掷骰子选定一条规则
    let randomValue = Math.random() * totalWeight;
    let selectedPattern = patterns[patterns.length - 1]; // Fallback
    
    for (const pattern of patterns) {
        randomValue -= pattern.weight;
        if (randomValue <= 0) {
            selectedPattern = pattern;
            break;
        }
    }

    // 2. 根据规则组装词条
    let alias = '';
    for (const token of selectedPattern.tokens) {
        if (/^N\d*$/i.test(token)) {
            alias += getRandomItem(nouns);
        } else if (/^A\d*$/i.test(token)) {
            // 如果规则里需要 A，但词库没有 A，需要做个兜底，这里简单处理为空字符串
            alias += adjectives.length > 0 ? getRandomItem(adjectives) : '';
        } else {
            alias += token;
        }
    }

    return alias;
};

// ================= 测试执行 =================

const csvData = `k,n1,n2,a1,a2,a3,a4,a5,a6,a7,a8,n3,n4,a9,a10
,,,,,,,,,,,,,,
,,,,,,,,,,,,,,
王,王子,,爱上王子的,献给王子的,侍奉王子的,,,,,,王子,,,
王,皇女,女王,爱上王女的,献给皇女的,献给女王的,侍奉女王的,,,,,公主,,,
王,姬,贵妇人,夺取公主的,爱上公主的,夺取贵妇人的,献给贵妇人的,侍奉公主的,供贵妇人使用的,,,,,,
王,王国,国,构筑国家的,倾国的,救世的,,,,,,王国,,,
王,帝国,无政府,反政府的,,,,,,,,帝国,,,`;

const patternData = `50,N+之+N
50,N+之+N2
50,N2+之+N
50,N+的+N
50,N+的+N2
50,N2+的+N
50,N+与+N
50,N+与+N2
50,N2+与+N
100,N+，+N+与+N
50,N+如+N
50,N+如+N2
50,N2+如+N
50,N+乃+N
50,N+乃+N2
50,N2+乃+N
15,N+N
15,N+N2
15,N2+N
15,N2+N2
4,A+N2
3,A2+N
2,A2+N2
1,A+N`;

// 分离数据解析与生成逻辑
const vocabulary = parseCsvVocabulary(csvData);
const rules = parsePatterns(patternData);

export const buildAlias = async ()=>{
    const csvtxt = await fs.promises.readFile(path.join(DATA_DIR,'Alias.csv'),'utf-8');
    parse(csvtxt)
};