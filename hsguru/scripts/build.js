// 构建最终的用户脚本
const fs = require('fs');
const path = require('path');

console.log('🔨 构建 HSGuru 用户脚本...\n');

// 读取模板文件
const templateFile = path.join(__dirname, '../src/template.js');
let template = fs.readFileSync(templateFile, 'utf8');

// 读取翻译数据
const dataDir = path.join(__dirname, '../data');
const uiTranslations = JSON.parse(fs.readFileSync(path.join(dataDir, 'ui-translations.json'), 'utf8'));
const expansions = JSON.parse(fs.readFileSync(path.join(dataDir, 'expansions.json'), 'utf8'));
const cardsCommon = JSON.parse(fs.readFileSync(path.join(dataDir, 'cards-common.json'), 'utf8'));
const cardsByExpansion = JSON.parse(fs.readFileSync(path.join(dataDir, 'cards-by-expansion.json'), 'utf8'));
const deckRules = JSON.parse(fs.readFileSync(path.join(dataDir, 'deck-rules.json'), 'utf8'));

console.log('✓ UI翻译:', Object.keys(uiTranslations).length, '条');
console.log('✓ 扩展包名称:', Object.keys(expansions).length, '条');
console.log('✓ 常用卡牌:', Object.keys(cardsCommon).length, '张');
console.log('✓ 扩展包卡牌:', Object.keys(cardsByExpansion).length, '个扩展包');

let totalExpansionCards = 0;
Object.entries(cardsByExpansion).forEach(([exp, cards]) => {
    const count = Object.keys(cards).length;
    totalExpansionCards += count;
    console.log(`  - ${exp}: ${count} 张`);
});

console.log('✓ 卡组前缀:', Object.keys(deckRules.prefix).length, '条');
console.log('✓ 卡组职业:', Object.keys(deckRules.class).length, '条\n');

// 转换为代码
function toUIMapCode(uiObj, expansionsObj) {
    const entries = [];
    
    // 先添加其他UI翻译
    Object.entries(uiObj).forEach(([k, v]) => {
        const key = k.replace(/'/g, "\\'");
        const val = v.replace(/'/g, "\\'");
        entries.push(`        ['${key}', '${val}']`);
    });
    
    // 添加版本名注释和内容
    entries.push(`        //版本名`);
    Object.entries(expansionsObj).forEach(([k, v]) => {
        const key = k.replace(/'/g, "\\'");
        const val = v.replace(/'/g, "\\'");
        entries.push(`        ['${key}', '${val}']`);
    });
    
    return `const uiTranslations = new Map([\n${entries.join(',\n')}\n\n    ]);`;
}

function toCardMapCode(commonObj, expansionsObj) {
    const entries = [];
    
    // 先添加常用卡牌
    Object.entries(commonObj).forEach(([k, v]) => {
        const key = k.replace(/'/g, "\\'");
        const val = v.replace(/'/g, "\\'");
        entries.push(`        ['${key}', '${val}']`);
    });
    
    // 按扩展包添加卡牌
    Object.entries(expansionsObj).forEach(([expansion, cards]) => {
        entries.push(`        // ${expansion}`);
        const cardEntries = Object.entries(cards);
        cardEntries.forEach(([k, v], index) => {
            const key = k.replace(/'/g, "\\'");
            const val = v.replace(/'/g, "\\'");
            entries.push(`        ['${key}', '${val}']`);
        });
    });
    
    return `const cardTranslations = new Map([\n${entries.join(',\n')}\n    ]);`;
}

function toDeckRulesCode(rules) {
    let code = 'const deckNameRules = {\n';
    code += '        // 前缀（包含种族、机制等）\n';
    code += '        prefix: {\n';
    
    const prefixEntries = Object.entries(rules.prefix).map(([k, v]) => {
        const key = k.replace(/'/g, "\\'");
        const val = v.replace(/'/g, "\\'");
        return `            '${key}': '${val}'`;
    });
    code += prefixEntries.join(',\n') + ',\n';
    code += '            // 动态添加所有符文组合\n';
    code += '            ...generateAllRuneCombinations()\n';
    code += '        },\n';
    code += '        // 职业后缀\n';
    code += '        class: {\n';
    
    const classEntries = Object.entries(rules.class).map(([k, v]) => {
        const key = k.replace(/'/g, "\\'");
        const val = v.replace(/'/g, "\\'");
        return `            '${key}': '${val}'`;
    });
    code += classEntries.join(',\n') + '\n';
    code += '        }\n';
    code += '    };';
    
    return code;
}

// 替换占位符
template = template.replace(
    /\/\* \{\{UI_TRANSLATIONS\}\} \*\//,
    toUIMapCode(uiTranslations, expansions)
);

template = template.replace(
    /\/\* \{\{CARD_TRANSLATIONS\}\} \*\//,
    toCardMapCode(cardsCommon, cardsByExpansion)
);

template = template.replace(
    /\/\* \{\{DECK_RULES\}\} \*\//,
    toDeckRulesCode(deckRules)
);

// 写入 dist 目录
const distDir = path.join(__dirname, '..');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const outputFile = path.join(distDir, 'HSGuru.user.js');
fs.writeFileSync(outputFile, template, 'utf8');

console.log('✅ 构建完成!');
console.log('📦 输出:', outputFile);
console.log('📊 大小:', (template.length / 1024).toFixed(2), 'KB');
console.log('📈 总翻译数:', Object.keys(uiTranslations).length + Object.keys(expansions).length + Object.keys(cardsCommon).length + totalExpansionCards + Object.keys(deckRules.prefix).length + Object.keys(deckRules.class).length, '条');
