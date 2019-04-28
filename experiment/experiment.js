const N = 1;
const TIME_STIM = 500;
const TIME_RESP = 10000;
const STIMULUS_PHASE1 = ['103', '145','142', '013', '010', '127', '139', '154', '007', '163', '079', '130', '172', '133', '031', '178', '193', '184', '061', '037', '085', '121', '196', '112', '052', '019', '169', '088', '055', '151', '160'];
const STIMULUS_PHASE2 = ['103', '145','142', '013', '010', '127', '139', '154', '007', '163', '079', '130', '172', '133', '031', '178', '193', '184', '061', '037', '085', '121', '196', '112', '052', '019', '169', '088', '055', '151', '160'];
const GROUP_ID = 'G1';//G1-grupa kontrolna  lub G2-grupa eksperymentalna

//text
const welocome_page_text = ['Dzień dobry. Nazywam się Natalia Gołębiewska, jestem studentką 3. roku kognitywistyki na Uniwersytecie Warszawskim. Poniższe badanie zostało przygotowane do celów naukowych i jest częścią mojej pracy licencjackiej dotyczącej systemów komputerowych poprawiajacych komunikację między ludźmi.'+
' Wyniki badania pozostaną poufne i będą rozpatrywane anonimowo. Serdecznie zapraszam do udziału.',
'Jeśli zgadza sie Pani/Pan na wzięcie udziału w badaniu, proszę nacisnąć przycisk DALEJ. W przeciwnym wypadku proszę zamknąć stronę.'];
const subject_info = [
	'Proszę podać adres e-mail. Posłuży on do ewentualnego kontaktu w przyszłości w przypadku kontynuacji badania',
	'Proszę podać wiek'
];
const instruction_text = ['<b> INSTRUKCJA:</b> <p>Badanie polega na szacowaniu liczby kropek, która pojawi się na rysunku. Za chwilę pojawi się seria obrazków oraz zaraz po każdym z nich suwak, za pomocą którego udziela się odpowiedzi. '+
'Przesunięcie suwaka w lewo oznacza mniejszą liczbę kropek, a w prawo większą. Dwa obrazki pod suwakiem oznaczają minimalną (maksymalne wychylenie suwaka w lewo) i maksymalną (maksymalne wychylenie suwaka w prawo) liczbę kropek. '+
'Uwaga, obrazki będą wyświetlane przez pół sekundy. Będą poprzedzone obrazkiem z krzyżykiem, a po nich pojawi się kratownica. Eksperyment składa sie z 30 obrazków. </p> <br/><b>Naciśnij przycisk "Dalej" aby rozpocząć.</b>'];
const username = [
	'Nazwa użytkownika',
];
const finish_page_text = ["Dziękuję za udział. Jeśli ma Pani/Pan jakieś uwagi odnośnie do badania to proszę o kontakt poprzez adres juliusz.baranski@student.uw.edu.pl lub wpisanie ich w poniższym okienku. </p> <b> ważne:</b> naciśnij 'Dodaj odpowiedzi' aby dodać swoje odpowiedzi"];

var timeline_phase1 = [];
var timeline_phase2 = [];


jsPsych.data.addProperties({
	subject: GROUP_ID,
	phase: "F1",
});

function saveData_csv(filename, filedata){
	$.ajax({
		type:'post',
		cache: false,
		url: 'analysis/save_data_csv.php',
		data: {filename: filename, filedata: filedata},
	});
};

// data parameter should be either the value of jsPsych.data()
// or the parameter that is passed to the on_data_update callback function for the core library
// jsPsych.data() contains ALL data
// the callback function will contain only the most recently written data.
function save_Data_mysql(data){
   var data_table = "my_experiment_table"; // change this for different experiments
   $.ajax({
      type:'post',
      cache: false,
      url: 'save_data_mysql.php', // change this to point to your php file.
      // opt_data is to add additional values to every row, like a subject ID
      // replace 'key' with the column name, and 'value' with the value.
      data: {
          table: data_table,
          json: JSON.stringify(data),
          opt_data: {key: value}
      },
      success: function(output) { console.log(output); } // write the result to javascript console
   });
};

var welcome_page = {
	type: 'instructions',
	pages: welocome_page_text,
	show_clickable_nav: true,
};

var subject_email_age = {
	type: 'survey-text',
	questions: subject_info,
};

var subject_sex = {
	type: 'survey-multi-choice',
	questions: ['Płeć:'],
	options: [['kobieta', 'mężczyzna']],
	//required: [true],
	horizontal: true,
};

var instruction = {
	type: 'instructions',
	pages: instruction_text,
	show_clickable_nav: true
}

timeline_phase1.push(welcome_page);
timeline_phase1.push(subject_email_age);
timeline_phase1.push(subject_sex);
timeline_phase1.push(instruction);

//adding stimuli
var stimulus_phase1 = [];
for (i = 0; i < STIMULUS_PHASE1.length; i++) {
	stimulus_phase1.push(['experiment/img/dots/dots_'+STIMULUS_PHASE1[i]+'.png']);
};

// adding learning phase
for ( i = 0; i < stimulus_phase1.length; i++) {
	var stimuli = {
		type: 'similarity',
		stimuli: stimulus_phase1[i],
		//prompt: "Suwak:",
		show_response: "POST_STIMULUS",
		phase:1,
		labels: ['7', '199'],
		img_labels: ['experiment/img/dots/dots_007.png', 'experiment/img/dots/dots_200.png'], //img labels
		timing_first_stim: TIME_STIM,
		timing_image_gap: 100,
	};
	timeline_phase1.push(stimuli);
};

var subject_username = {
	type: 'survey-text',
	questions: username,
};

timeline_phase1.push(subject_username);



var stimulus_phase2 = [];
for (i = 0; i < STIMULUS_PHASE2.length; i++) {
	stimulus_phase2.push(['experiment/img/dots/dots_'+STIMULUS_PHASE2[i]+'.png']);
};

for ( i = 0; i < stimulus_phase2.length; i++) {
	var stimuli = {
		type: 'similarity',
		stimuli: stimulus_phase2[i],
		//prompt: "Suwak:",
		show_response: "POST_STIMULUS",
		phase: 2,
		labels: ['7', '199'],
		img_labels: ['experiment/img/dots/dots_007.png', 'experiment/img/dots/dots_200.png'], //img labels
		timing_first_stim: TIME_STIM,
		timing_image_gap: 100,
	};
	timeline_phase2.push(stimuli);
}

var finish_page = {
	type: 'survey-text',
	questions: finish_page_text,
};

timeline_phase2.push(finish_page);

var thankyou = {
	type: 'text',
	text: ['Wyniki zostały przesłane. Dziękuję.']
};

function pass_messages(msg) {

	// $("#messages").html("<input type=\"text\" name=\"name\" id=\"text_input\" /><button id=\"confirm_button\">Send</button>");
	// $("#confirm_button").click(function() {
	// 	client.send_message(peer_id, "RESPONSE", $("#text_input").val());
	// 	$("#messages").html("Value send");
	// });
	//
	// client.read_message("RESPONSE", function(msg) { alert(msg["content"]) }, null, null);
	$('#messages').html('');
	jsPsych.init({
		timeline: timeline_phase2,

		on_finish: function(data) {
			timeline: [thankyou]
		}
	});
}

function reset_agent() {
	$('#messages').html('Oczekiwanie na partnera');
	peer_id = null;
	wait_for_peer();
}

function wait_for_peer() {
	client.read_message("JOIN_OFFER", function(msg) {
		if(peer_id == null) {
			peer_id = msg["sender"];
			pass_messages();
		}
	}, null, null);
}

jsPsych.init({
	timeline: timeline_phase1,
	on_finish: function(data) {
		// saveData_csv("badanie1_", jsPsych.data.dataAsCSV());

		var data = jsPsych.data.getLastTrialData();
	 	var username = JSON.parse(data['responses'])['Q0'];

		client = new MessageClient(null);
		client.login(username, reset_agent);

	}
});
