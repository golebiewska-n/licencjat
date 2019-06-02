/**
 * modified jspsych-similarity.js
 * This plugin create a trial where one image id shown, and the subject rates it using a slider controlled with the mouse.
 *
 */

//globalne zmienne tutaj
jsPsych.plugins.similarity = (function() {
  var plugin = {};

  jsPsych.pluginAPI.registerPreload('similarity', 'stimuli', 'image');

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.img_labels = trial.img_labels || null; //urls to image labels for slider
    trial.intervals = trial.intervals || 100;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;

    trial.show_response = trial.show_response || "FIRST_STIMULUS";

    trial.timing_first_stim = trial.timing_first_stim || 1000; // default 1000ms
    trial.timing_fixation = 500;
    trial.timing_mask = 200;

    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];


    // show the images
    display_element.append($('<img>', {
      "src": "",
      "id": 'jspsych-sim-stim'
    }));

    showFixationScreen();
    setTimeoutHandlers.push(setTimeout(function() {
      showStimuli();
      setTimeoutHandlers.push(setTimeout(function() {
        showMaskScreen();
        setTimeoutHandlers.push(setTimeout(function() {
          hideImg();
          showAnswerScreen();
        }, trial.timing_mask));
      }, trial.timing_first_stim));
    }, trial.timing_fixation));


    function showFixationScreen(){
      $('#jspsych-sim-stim').attr('src', 'experiment/img/cross.png')
    }

    function showMaskScreen(){
      $('#jspsych-sim-stim').attr('src', 'experiment/img/mask.png')
    }

    function hideImg() {
      $('#jspsych-sim-stim').css('display', 'none');
    }

    function showStimuli(){
      $('#jspsych-sim-stim').attr('src', trial.stimuli[0]);
    }

    function showAnswerScreen(){
      if (trial.show_response == "POST_STIMULUS") {
        show_response_slider(display_element, trial);
      }
    }

    function show_response_slider(display_element, trial) {

      var startTime = (new Date()).getTime();

      display_element.css("text-align", "center");

      // create slider
      display_element.append('<br/><br/><br/><br/><br/><br/>');

      display_element.append($('<img>', {
        'src': 'experiment/img/dots/dots_007.png',
        'css': {
          'width': '150px',
          'border-style': 'solid',
          'display': 'inline-block',
          'vertical-align': 'middle'
        }
      }));

      display_element.append($('<div>', {
        'id': 'slider',
        'class': 'sim',
        'css': {
          'width': '400px',
          'display': 'inline-block',
          'vertical-align': 'middle'
        }
      }));

      display_element.append($('<img>', {
        'src': 'experiment/img/dots/dots_200.png',
        'css': {
          'width': '150px',
          'border-style': 'solid',
          'display': 'inline-block',
          'vertical-align': 'middle'
        }
      }));

      //  create button
      display_element.append($('<button>', {
        'id': 'next',
        'class': 'sim',
        'html': 'Dodaj odpowiedź',
        'css':{
          'float': 'middle',
          'margin': '10px'
        }
      }));

      $("#slider").slider({
        value: Math.ceil(trial.intervals / 2),
        min: 1,
        max: trial.intervals,
        step: 0.01,
      });

      // show tick marks
      if (trial.show_ticks) {
        for (var j = 1; j < trial.intervals - 1; j++) {
          $('#slider').append('<div class="slidertickmark"></div>');
        }

        $('#slider .slidertickmark').each(function(index) {
          var left = (index + 1) * (100 / (trial.intervals - 1));
          $(this).css({
            'position': 'absolute',
            'left': left + '%',
            'width': '1px',
            'height': '100%',
            'background-color': '#222222'
          });
        });
      }

      // position labels to match slider intervals
      var slider_width = $("#slider").width();
      var num_items = trial.labels.length;
      var item_width = slider_width / num_items;
      var spacing_interval = slider_width / (num_items - 1);

      $("#sliderlabels li").each(function(index) {
        $(this).css({
          'display': 'inline-block',
          'width': item_width + 'px',
          'margin': '0px',
          'padding': '0px',
          'text-align': 'center',
          'position': 'absolute',
          'left': (spacing_interval * index) - (item_width / 2)
        });
      });



      // if prompt is set, show prompt
      if (trial.prompt !== "") {
        display_element.append(trial.prompt);
      }


      $("#next").click(function() {

          var endTime = (new Date()).getTime();
          var response_time = endTime - startTime;

          // kill any remaining setTimeout handlers
          for (var i = 0; i < setTimeoutHandlers.length; i++) {
            clearTimeout(setTimeoutHandlers[i]);
          }

          var score = $("#slider").slider("value");
          var trial_data = {
            "sim_score": score,
            "rt": response_time,
            "stimulus": trial.stimuli[0]
          };

          // goto next trial in block
          display_element.html('');

          if(trial.phase == 2){
            var startTime_answer = (new Date()).getTime();

            display_element.css("text-align", "center");

            //show partner's answers
            display_element.append($('<p id="messages">Oczekiwanie na odpowiedź partnera.</p>'));
            display_element.append($('<p id="slider-position"></p>'));
            client.send_message(peer_id, "RESPONSE", score);
          	client.read_message("RESPONSE", function(msg) {
              $('#messages').html('Odpowiedź partnera: <br>');


              $('#messages').append($('<img>', {
                'src': 'experiment/img/dots/dots_007.png',
                'css': {
                  'width': '150px',
                  'border-style': 'solid',
                  'display': 'inline-block',
                  'vertical-align': 'middle'
                }
              }));

              $('#messages').append($('<div>', {
                'id': 'slider-position',
                'class': 'sim',
                'css': {
                  'width': '400px',
                  'display': 'inline-block',
                  'vertical-align': 'middle'
                }
              }));

              $('#messages').append($('<img>', {
                'src': 'experiment/img/dots/dots_200.png',
                'css': {
                  'width': '150px',
                  'border-style': 'solid',
                  'display': 'inline-block',
                  'vertical-align': 'middle'
                }
              }));
              $('#slider-position').slider({
                value: msg['content'],
                min: 1,
                max: trial.intervals,
                step: 0.01,
              }).slider('disable');
            }, null, null);

            // create select
            display_element.append($('<p>Czy widzi Pan/Pani tę samą liczbkę kropek, co Pana/Pani partner?</p>', ));
            display_element.append($('<input type="radio" name="answer" value="yes">', ));
            display_element.append($('<span style="margin-right:50px">Tak</span>',));
            display_element.append($('<input type="radio" name="answer" value="no">', ));
            display_element.append($('<span>Nie</span><br>', ));

            //  create button
            display_element.append($('<button>', {
              'id': 'next',
              'class': 'sim',
              'html': 'Dodaj odpowiedź',
              'css':{
                'float': 'middle',
                'margin': '10px'
              }
            }));

            // finish trial
            $("#next").click(function() {
              var endTime_answer = (new Date()).getTime();
              var response_time_answer = endTime_answer - startTime_answer;

              // kill any remaining setTimeout handlers
              for (var i = 0; i < setTimeoutHandlers.length; i++) {
                clearTimeout(setTimeoutHandlers[i]);
              }

              var answer = $("input[name='answer']:checked").val();
              trial_data.answer = answer;
              trial_data.rt_answer = response_time_answer;

              // goto next trial in block
              display_element.html('');

              jsPsych.finishTrial(trial_data);
            });
          }
          else{
            jsPsych.finishTrial(trial_data);
          }

        });
      }


    }
  return plugin;
})();
