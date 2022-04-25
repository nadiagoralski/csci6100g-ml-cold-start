require('dotenv').config();

const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const {PythonShell} = require('python-shell')

const _ = require("underscore");

const difficultyOpts = require('./difficulty.config.json');
let recommend_difficulty_script = './cold-start-optimization/recommend_difficulty.py';


// initialize configuration
const port = process.env.SERVER_PORT || 3000;
const app = express();

// configure express
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// configure ejs views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.locals.assignmentPartial = (difficulty) => {
    let type = difficulty < 4 ? 'sortable' : 'writable';
    let template = fs.readFileSync(path.join(__dirname, `views/partials/${type}.ejs`), 'utf-8');
    return ejs.render(template);
}

let codeFilePath = './code/get_avg_double_highest.py';
let currentDifficulty = 0;
let surveyValues = null;
let surveyId = null;

//
app.get("/", (req, res) => {
	if (surveyValues == null) {
		res.redirect('/survey')
	} else {
		currentDifficulty = req.query.difficulty ? parseInt(req.query.difficulty) : currentDifficulty
		console.log(`current ${currentDifficulty}`);
		console.log(_.where(difficultyOpts, {difficulty: currentDifficulty})[0]);
		let retData = {
			title: ' Title  ',
			description: 'Description of problem',
			note: 'Extra notes for problem',
			initial: fs.readFileSync(codeFilePath, 'utf8'),
			difficulty: currentDifficulty,
			difficultyOpts: _.where(difficultyOpts, {difficulty: currentDifficulty})[0]

		}
		/**
		 * here we would render index page for the problem,
		 * however in this prototype we will just simulate the user
		 * completion using ./cold-start-optimization/error-log.stub.json
		 * to simulate some errors a user encounters and log them to the historic data.
		 * This would be called when the page unloads (i.e. the user is done with the current problem)
		 */
		//res.render("index", retData);
		res.redirect('/simulateProblemEnd')
	}

});

// load survey
app.get("/survey", (req, res) => {
	res.sendFile(__dirname + '/views/survey.html');
});

// survey submit
app.post('/survey', (req, res) => {
	surveyValues = JSON.stringify(req.body);

	PythonShell.run(recommend_difficulty_script, {args: surveyValues}, function (err,output) {
		if (err) {
			console.log(err);
			res.sendFile(__dirname + '/views/survey.html');
		} else {
			// output is an array [survey_result_id, round(prediction.est), prediction.est]
			console.log(output);
			surveyId = parseInt(output[0])
			currentDifficulty = parseInt(output[1])

			res.redirect('/')
		}


	});

	//
});


////user manually changes difficulty
// app.post("/changeDifficulty", (req, res) => {
//
// 	currentDifficulty = req.body.difficulty < 4 ? parseInt(req.body.difficulty) + 1 : 0
// 	console.log(`change ${currentDifficulty}`)
// 	let retData = {
// 		title: ' Title  ',
// 		description: 'Description of problem',
// 		note: 'Extra notes for problem',
// 		initial: fs.readFileSync(codeFilePath, 'utf8'),
// 		difficulty: currentDifficulty,
// 	}
//
// 	res.render("index", retData);
// });

app.get("/simulateProblemEnd", (req, res) => {
	// log data would be sent from the front end to here
	// we use a JSON file with a sample for demonstration purposes
	let logData = JSON.parse(fs.readFileSync('./cold-start-optimization/error-log.stub.json', 'utf8'));
	console.log(logData);
	let errorCount = 0;
	logData.forEach(log => {
		if (log['errors']) {
			errorCount += log['errors'].length
		}
	});

	let sendData = [surveyId, currentDifficulty, errorCount];
	PythonShell.run('./cold-start-optimization/log_historic.py', {args: sendData}, function (err,output) {
		if (err) res.send(err)

		// output is an array [survey_result_id, round(prediction.est), prediction.est]
		console.log(output);

		res.send(`user data added, surveyID=${surveyId}, errorCount=${errorCount}`);
	});
});

// run server
app.listen(port, () => {
    console.log(`Server Started on Port ${port}`)
});

