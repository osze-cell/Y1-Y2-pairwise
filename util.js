function create_tv_array(json_object) {
    // Separate items by age group
    let old_items = json_object.filter(t => t.age === 'old');
    let young_items = json_object.filter(t => t.age === 'young');

    // Group each age by statement_number -> { true: item, false: item }
    let old_groups = groupByStatement(old_items);
    let young_groups = groupByStatement(young_items);

    // Get all statement numbers and shuffle them
    let statement_numbers = Object.keys(old_groups).map(Number);
    shuffle(statement_numbers);

    // Split: first half -> old, second half -> young
    // Each statement_number is used exactly once across the entire experiment
    let half = Math.floor(statement_numbers.length / 2); // 18
    let old_sns = statement_numbers.slice(0, half);
    let young_sns = statement_numbers.slice(half, half * 2);

    // For old: pick TRUE or FALSE per statement, balanced (half true, half false)
    let old_selected = selectBalancedFromSubset(old_groups, old_sns);
    // For young: same
    let young_selected = selectBalancedFromSubset(young_groups, young_sns);

    // Pair old[i] with young[i] — guaranteed different statement_numbers
    // since they come from disjoint sets
    let tv_array = [];
    for (let i = 0; i < half; i++) {
        let old_item = old_selected[i];
        let young_item = young_selected[i];

        // Randomize which speaker is heard first vs second
        let old_first = Math.random() < 0.5;
        let first_item = old_first ? old_item : young_item;
        let second_item = old_first ? young_item : old_item;

        tv_array.push({
            stimulus_1: first_item.stimulus,
            stimulus_2: second_item.stimulus,
            data: {
                // First audio info
                first_age: first_item.age,
                first_statement_number: first_item.statement_number,
                first_statement: first_item.statement,
                first_truth: first_item.truth,
                first_stimulus: first_item.stimulus,
                first_gender: first_item.gender,
                // Second audio info
                second_age: second_item.age,
                second_statement_number: second_item.statement_number,
                second_statement: second_item.statement,
                second_truth: second_item.truth,
                second_stimulus: second_item.stimulus,
                second_gender: second_item.gender,
                // Presentation order
                old_first: old_first
            }
        });
    }
    return tv_array;
}

// Group items by statement_number, keyed by truth value
function groupByStatement(items) {
    let groups = {};
    for (let item of items) {
        let sn = item.statement_number;
        if (!groups[sn]) groups[sn] = {};
        groups[sn][item.truth.toLowerCase()] = item;
    }
    return groups;
}

// Fisher-Yates shuffle (in-place)
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Select one version (true or false) per statement from a subset, balanced 50/50
function selectBalancedFromSubset(groups, sns) {
    let n = sns.length;
    let half = Math.floor(n / 2);
    // Create assignment array: half "true", rest "false"
    let assignments = [];
    for (let i = 0; i < half; i++) assignments.push("true");
    for (let i = 0; i < n - half; i++) assignments.push("false");
    shuffle(assignments);
    // Pick matching version for each statement
    return sns.map((sn, idx) => {
        let pick = groups[sn][assignments[idx]];
        if (!pick) pick = groups[sn]["true"] || groups[sn]["false"]; // fallback
        return pick;
    });
}