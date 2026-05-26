// AI Text Humanizer — Core transformation rules
const Humanizer = {
    // Pattern replacements for robotic language
    rules: {
        natural: [
            // Transition words
            [/\bFurthermore\b/gi, 'Plus'],
            [/\bMoreover\b/gi, 'Also'],
            [/\bNevertheless\b/gi, 'Still'],
            [/\bConsequently\b/gi, 'So'],
            [/\bAccordingly\b/gi, 'So'],
            [/\bHence\b/gi, 'So'],
            [/\bThus\b/gi, 'So'],
            [/\bTherefore\b/gi, 'So'],
            [/\bAdditionally\b/gi, 'Also'],
            [/\bIn addition\b/gi, 'Also'],
            [/\bHowever\b/gi, 'But'],
            [/\bNonetheless\b/gi, 'Even so'],
            [/\bSubsequently\b/gi, 'Then'],
            
            // AI pattern markers
            [/\bIn conclusion\b/gi, 'Bottom line'],
            [/\bIt is worth noting that\b/gi, 'Note that'],
            [/\bIt is important to note that\b/gi, 'Keep in mind'],
            [/\bIt should be noted that\b/gi, ''],
            [/\bIt can be argued that\b/gi, ''],
            [/\bIt is evident that\b/gi, 'Clearly'],
            [/\bIn order to\b/gi, 'To'],
            [/\bDue to the fact that\b/gi, 'Because'],
            [/\bIn the event that\b/gi, 'If'],
            [/\bA large number of\b/gi, 'Many'],
            [/\bThe vast majority of\b/gi, 'Most'],
            [/\bIn the modern era\b/gi, 'Today'],
            [/\bIn today\'s digital age\b/gi, 'Today'],
            [/\bIn today\'s fast-paced world\b/gi, 'These days'],
            [/\bHas revolutionized\b/gi, 'has changed'],
            [/\bParadigm shift\b/gi, 'big change'],
            [/\bGame-changer\b/gi, 'major improvement'],
            [/\bLeverage\b/gi, 'use'],
            [/\bUtilize\b/gi, 'use'],
            [/\bFacilitate\b/gi, 'help with'],
            [/\bOptimize\b/gi, 'improve'],
            [/\bImplement\b/gi, 'put in place'],
            [/\bSpearhead\b/gi, 'lead'],
            [/\bSynergize\b/gi, 'combine'],
            
            // Passive to active hints
            [/\bIt is (recommended|suggested|advised) that\b/gi, 'We recommend'],
            [/\bIt can be seen that\b/gi, 'You can see'],
            [/\bIt has been found that\b/gi, 'We found'],
            [/\bIt was determined that\b/gi, 'We determined'],
            
            // Overly formal
            [/\bcommence\b/gi, 'start'],
            [/\bterminate\b/gi, 'end'],
            [/\bendeavor\b/gi, 'try'],
            [/\bascertain\b/gi, 'find out'],
            [/\bdemonstrate\b/gi, 'show'],
            [/\bexhibit\b/gi, 'show'],
            [/\bpossess\b/gi, 'have'],
            [/\brequire\b/gi, 'need'],
            [/\brequest\b/gi, 'ask for'],
            [/\bobtain\b/gi, 'get'],
            [/\bprovide\b/gi, 'give'],
            [/\badditional\b/gi, 'more'],
            [/\bnumerous\b/gi, 'many'],
            [/\bsubstantial\b/gi, 'big'],
            [/\bsignificant\b/gi, 'important'],
            [/\bregarding\b/gi, 'about'],
            [/\bpertaining to\b/gi, 'about'],
            [/\bwith regard to\b/gi, 'about'],
            [/\bin terms of\b/gi, 'for'],
            [/\bprior to\b/gi, 'before'],
            [/\bsubsequent to\b/gi, 'after'],
            [/\bin the vicinity of\b/gi, 'near'],
            [/\bat the present time\b/gi, 'now'],
            [/\bin the near future\b/gi, 'soon'],
            [/\baforementioned\b/gi, 'mentioned'],
        ],
        casual: [
            // Same as natural but more casual
            [/\bPlus\b/g, 'And'],
            [/\bAlso\b/g, 'And'],
            [/\bBut\b/g, 'though'],
            [/\bSo\b/g, 'so yeah'],
            [/\bI would argue\b/gi, 'I think'],
            [/\bIt seems that\b/gi, 'Looks like'],
            [/\bhowever\b/gi, 'but'],
            [/\btherefore\b/gi, 'so'],
            [/\babout\b/gi, 'on'],
        ],
        professional: [
            // Keep formal but remove AI markers
            [/\bIt is worth noting that\b/gi, 'Note that'],
            [/\bIt should be noted that\b/gi, ''],
            [/\bIn conclusion\b/gi, 'In summary'],
            [/\bGame-changer\b/gi, 'transformative'],
            [/\bLeverage\b/gi, 'utilize'],
            [/\bA lot of\b/gi, 'A significant number of'],
        ],
        creative: [
            // Add flair, remove boring
            [/\bimportant\b/gi, 'crucial'],
            [/\bgood\b/gi, 'excellent'],
            [/\bbig\b/gi, 'massive'],
            [/\bsmall\b/gi, 'tiny'],
            [/\binteresting\b/gi, 'fascinating'],
            [/\bvery\b/gi, 'incredibly'],
            [/\breally\b/gi, 'truly'],
        ]
    },

    humanize(text, style = 'natural') {
        let result = text;
        const changes = [];
        
        // Apply base natural rules first (for all styles)
        if (style !== 'professional') {
            this.rules.natural.forEach(([pattern, replacement]) => {
                const before = result;
                result = result.replace(pattern, replacement);
                if (before !== result) {
                    changes.push(`"${pattern.source.replace(/\\b/g,'')}" → "${replacement}"`);
                }
            });
        }

        // Apply style-specific rules
        if (this.rules[style] && style !== 'natural') {
            this.rules[style].forEach(([pattern, replacement]) => {
                const before = result;
                result = result.replace(pattern, replacement);
                if (before !== result) {
                    changes.push(`[${style}] "${pattern.source.replace(/\\b/g,'')}" → "${replacement}"`);
                }
            });
        }

        // Sentence variety: break up long sentences
        result = this.varySentences(result);
        const beforeLength = result.length;
        
        // Remove double spaces and clean up
        result = result.replace(/  +/g, ' ');
        result = result.replace(/\n{3,}/g, '\n\n');
        result = result.replace(/\.\.\.+/g, '...');

        return { text: result.trim(), changes };
    },

    varySentences(text) {
        // Split into sentences and vary connectors
        const sentences = text.match(/[^.!?]+[.!?]+[\])'"`'""']*/g) || [text];
        
        if (sentences.length < 3) return text;
        
        // Don't start consecutive sentences with the same word
        const starters = ['The', 'This', 'It', 'These', 'A', 'An'];
        for (let i = 1; i < sentences.length; i++) {
            const trimmed = sentences[i].trim();
            for (const starter of starters) {
                if (trimmed.startsWith(starter + ' ') && sentences[i-1].trim().startsWith(starter + ' ')) {
                    // Add a connector or rephrase hint
                    sentences[i] = sentences[i].replace(starter + ' ', '');
                    sentences[i] = sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
                }
            }
        }
        
        return sentences.join(' ');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Humanizer;
}
