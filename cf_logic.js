/**
 * Certainty Factor Inference Engine
 */

export class CertaintyFactorSystem {
    constructor(rules, hypotheses) {
        this.rules = rules;
        this.hypotheses = hypotheses;
    }

    /**
     * Calculate CF for all hypotheses based on user inputs.
     * @param {Array<{symptomId: string, cfUser: number}>} userInputs 
     * @returns {Object} { results: Array, log: Array }
     */
    calculate(userInputs) {
        let results = {};
        let log = []; // Calculation log

        // Initialize hypotheses scores
        this.hypotheses.forEach(h => {
            results[h.id] = 0.0;
        });

        log.push("=== 1. Pencocokan Aturan (Rule Matching) ===");

        // 1. Calculate CF for each rule application
        // Group applied rules by hypothesis
        let hypothesisUpdates = {}; 

        userInputs.forEach(input => {
            // Find rules triggered by this symptom
            const triggeredRules = this.rules.filter(r => r.symptomId === input.symptomId);
            
            triggeredRules.forEach(rule => {
                // Determine Rule CF based on MB and MD
                // Default to 0 if undefined (backward compatibility)
                const mb = rule.mb !== undefined ? rule.mb : 0;
                const md = rule.md !== undefined ? rule.md : 0;
                
                // If cfExpert exists (legacy), use it, otherwise calculate from MB-MD
                const cfExpert = rule.cfExpert !== undefined ? rule.cfExpert : (mb - md);
                
                const cfRule = input.cfUser * cfExpert;
                
                log.push(`Gejala [${input.symptomId}] (CF User: ${input.cfUser}) match dengan [${rule.hypothesisId}]`);
                log.push(`   MB: ${mb}, MD: ${md} => CF Pakar: ${cfExpert.toFixed(2)}`);
                log.push(`   -> CF Rule = ${input.cfUser} * ${cfExpert.toFixed(2)} = ${cfRule.toFixed(3)}`);

                if (!hypothesisUpdates[rule.hypothesisId]) {
                    hypothesisUpdates[rule.hypothesisId] = [];
                }
                hypothesisUpdates[rule.hypothesisId].push(cfRule);
            });
        });

        log.push("\n=== 2. Kombinasi CF (Combine CF) ===");

        // 2. Combine CFs for each hypothesis
        for (const [hId, crValues] of Object.entries(hypothesisUpdates)) {
            if (crValues.length > 0) {
                log.push(`\nMenghitung CF untuk ${hId}:`);
                
                // Combine sequentially
                let currentCF = crValues[0];
                log.push(`   CF(1) = ${currentCF.toFixed(3)}`);

                for (let i = 1; i < crValues.length; i++) {
                    const nextCF = crValues[i];
                    const oldCF = currentCF;
                    currentCF = this.combineCF(currentCF, nextCF);
                    
                    if (oldCF > 0 && nextCF > 0) {
                        log.push(`   CF Combined = ${oldCF.toFixed(3)} + ${nextCF.toFixed(3)} * (1 - ${oldCF.toFixed(3)}) = ${currentCF.toFixed(3)}`);
                    } else if (oldCF < 0 && nextCF < 0) {
                         log.push(`   CF Combined = ${oldCF.toFixed(3)} + ${nextCF.toFixed(3)} * (1 + ${oldCF.toFixed(3)}) = ${currentCF.toFixed(3)}`);
                    } else {
                        log.push(`   CF Combined = (${oldCF.toFixed(3)} + ${nextCF.toFixed(3)}) / (1 - min(|${oldCF.toFixed(3)}|, |${nextCF.toFixed(3)}|)) = ${currentCF.toFixed(3)}`);
                    }
                }
                results[hId] = currentCF;
                log.push(`-> Hasil Akhir ${hId}: ${(currentCF * 100).toFixed(2)}%`);
            }
        }

        // 3. Format results
        const formattedResults = this.hypotheses.map(h => {
            const val = results[h.id] || 0;
            return {
                hypothesis: h,
                percentage: (val * 100).toFixed(2) + '%',
                exactValue: val
            };
        }).sort((a, b) => b.exactValue - a.exactValue);

        return {
            results: formattedResults,
            log: log
        };
    }

    /**
     * Combine two CF values.
     * Formula assumes both are positive for this specific expert system scope.
     * If we add negative CFs, we'd need the full formula.
     */
    combineCF(cfOld, cfNew) {
        if (cfOld > 0 && cfNew > 0) {
            return cfOld + cfNew * (1 - cfOld);
        }
        if (cfOld < 0 && cfNew < 0) {
            return cfOld + cfNew * (1 + cfOld);
        }
        // One positive, one negative
        return (cfOld + cfNew) / (1 - Math.min(Math.abs(cfOld), Math.abs(cfNew)));
    }
}
