// pairwise Y1Y2 file
        const jsPsych = initJsPsych({
            show_progress_bar: true,
            on_finish: function(data) {
            window.location.href = 'finish.html';
            }
        });


        const subject_id = jsPsych.randomization.randomID(10);
        const filename = `${subject_id}.csv`;

        let timeline = [];
        
        // TODO: edit the consent form as needed
        const irb = {
            // Which plugin to use
            type: jsPsychHtmlButtonResponse,
            // What should be displayed on the screen
            stimulus: '<p><font size="3">We invite you to participate in a research study on language comprehension of artifical voices.</font></p>',
            // What should the button(s) say
            choices: ['Continue']
        };
        // push to the timeline
        timeline.push(irb)      
        
        // TODO: edit the instruction form as needed
        const instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: "In this experiment, you will hear two statements in each trial, spoken by different speakers. After hearing both statements, please indicate which statement you think is TRUE. <br><br>Press <b>D</b> for the <b>first</b> statement, or <b>K</b> for the <b>second</b> statement.<br>Please ensure that you are in a quiet environment or are wearing headphones for the duration of this study.<br>When you're ready to begin, press the space bar.",
            choices: [" "]
        };
        timeline.push(instructions);

        let tv_array = create_tv_array(trial_objects);
        const trials = {
            timeline: [
                {
                    // Play both audios sequentially on the same page, then collect response
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: function() {
                        let s1 = jsPsych.timelineVariable('stimulus_1');
                        let s2 = jsPsych.timelineVariable('stimulus_2');
                        return `<div id="audio-paths" data-stim1="${s1}" data-stim2="${s2}"></div>
                                <p id="audio-status" style="font-size:20px;">Listen to <b>Statement 1</b>...</p>
                                <p id="response-prompt" style="font-size:20px; visibility:hidden;">Which statement was <b>TRUE</b>?</p>
                                <div class="option_container" style="visibility:hidden;">
                                    <div class="option">First<br><br><b>D</b></div>
                                    <div class="option">Second<br><br><b>K</b></div>
                                </div>`;
                    },
                    choices: "NO_KEYS",
                    response_ends_trial: false,
                    data: jsPsych.timelineVariable('data'),
                    on_load: function() {
                        let pathsEl = document.getElementById('audio-paths');
                        let stim1 = pathsEl.dataset.stim1;
                        let stim2 = pathsEl.dataset.stim2;
                        let audio1 = new Audio(stim1);
                        let audio2 = new Audio(stim2);
                        let statusEl = document.getElementById('audio-status');
                        let responsePrompt = document.getElementById('response-prompt');
                        let optionContainer = document.querySelector('.option_container');

                        audio1.play();
                        audio1.addEventListener('ended', function() {
                            setTimeout(function() {
                                statusEl.innerHTML = 'Listen to <b>Statement 2</b>...';
                                audio2.play();
                            }, 500);
                        });
                        audio2.addEventListener('ended', function() {
                            statusEl.innerHTML = 'Both statements played. Make your choice.';
                            responsePrompt.style.visibility = 'visible';
                            optionContainer.style.visibility = 'visible';
                            let audio2EndTime = performance.now();
                            document.addEventListener('keydown', function handler(e) {
                                if (e.key === 'd' || e.key === 'k') {
                                    document.removeEventListener('keydown', handler);
                                    jsPsych.finishTrial({
                                        response: e.key,
                                        rt: performance.now() - audio2EndTime
                                    });
                                }
                            });
                        });
                    }
                },
                {
                    type: jsPsychHtmlKeyboardResponse,
                    choices: "NO_KEYS",
                    stimulus: "",
                    response_ends_trial: false,
                    trial_duration: 1000
                }
            ],
            timeline_variables: tv_array,
            randomize_order: true
        }
        timeline.push(trials);

        const save_data = {
                    type: jsPsychPipe,
                    action: "save",
                    experiment_id: "Fbx9ga4nfKyb",
                    filename: filename,
                    data_string: ()=>jsPsych.data.get().csv()
                };

        timeline.push(save_data);
        

        jsPsych.run(timeline)
