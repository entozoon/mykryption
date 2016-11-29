console.log('********************************************************************************');
console.log('*               Welcome to (the poorly named) Mykryption                       *');
console.log('********************************************************************************');

process.chdir('../');
console.log('Running from ' + process.cwd());

const folders = ['Films', 'Shows'],
	crypts = require('./crypts.js'),
	inquirer = require('inquirer'),
	fs = require('fs'),
	exec = require('child_process').execSync;

var log = './Public/mykryption.log.json';
var pooswood = 'not-hard-coded-because-thats-retarded';
var deleteOriginals;

//
// This MUST be a file in parent dir containing at least just {}
//

try {
	fs.accessSync(log, fs.F_OK);
	var enkryptionLog = JSON.parse(fs.readFileSync(log, 'utf8'));
} catch (e) {
	var enkryptionLog = {};
}

function testFilenameEncryption() {
	// TEST FILENAME ENKRYPTIONS
	console.log('\n*********************** Testing Enkryptions Real Quick *************************');
	var filenameTest = 'My.Mytrax.1891.167p HPCD.X112-nhs.mppg3';
	console.log('Original filename:');
	console.log(filenameTest);
	console.log('\nLogged filename (enkrypted):');
	console.log(crypts.enkrypt(filenameTest, 'poswodtest'));
	console.log('\nLogged filename (dekrypted):');
	console.log(crypts.dekrypt(crypts.enkrypt(filenameTest, 'ciphertest'), 'ciphertest'));
	console.log('\nActual filename (befuddled):');
	console.log(crypts.befuddle(filenameTest) + '.mdata');
	console.log('********************************************************************************');
}


function execAndLog(cmd) {
	console.log(cmd);
	exec(cmd);
}

function enkryptFolder(folder) {
	//fs.readdir(folder, (err, files) => { //readdirSync?
	var files = fs.readdirSync(folder);
		// If it contains files
	if (files != null) {
		// For each file
		files.forEach(file => {
			// If not .bat, .js or enkrypted file
			if (file.substr(-4) != '.bat' &&
				file.substr(-3) != '.js' &&
				file.substr(-6) != '.mdata'
			) {
				process.stdout.write('.');

				// Output to log
				enkryptionLog[crypts.enkrypt(folder + '/' + file, pooswood)] = crypts.befuddle(file) + '.mdata';
				fs.writeFile(
					log,
					JSON.stringify(enkryptionLog, null, 4),
					function(err) {
						if (err != null) {
							console.log('To err is human: ' + err);
						}
					}
				);

				// if previously enkrypted
				if (fs.existsSync('Public\\' + crypts.befuddle(file) + '.mdata')) {
					console.log(file + '\nis already enkrypted as:\n' + crypts.befuddle(file) + '.mdata\n');
				} else {
					/*  7z
						a            Add File
						-mx0         No compression
						-mhe=on      Filename enkryption
						-mmt=on      Enable multithreading
						-sdel        Delete after compression!
						-p[password]
						output
						input

						7z a -mx0 -mhe=on -mmt=on -pmypassword dwa.mp4.mdata dwa.mp4
					*/
					var zdelete = '';
					if (deleteOriginals) zdelete = '-sdel ';

					// Enkrypt file
					execAndLog('7z a -mx0 -mhe=on -mmt=on ' + zdelete + '-p' + pooswood + ' "Public\\' + crypts.befuddle(file) + '.mdata" "' + folder + '\\' + file + '"');
					console.log('********************************************************************************');
				}
			}
		});
	}
}

function dekryptFile(filename) {
	// 7z x -y -bb1 -p%pass% %1
	execAndLog('7z x -y -bb1 -p' + pooswood + ' ' + filename);
}

function createFileList() {
	var enkryptionLog = JSON.parse(fs.readFileSync(log, 'utf8'));
	var fileList = [];
	for (var enkrypted in enkryptionLog) {
		fileList.push({
			'originalFilename': crypts.dekrypt(enkrypted, pooswood),
			'actualFilename': './Public/' + enkryptionLog[enkrypted]
		});
	}

	// Sort by originalFilename
	fileList.sort(function(a,b) {
		if (a.originalFilename < b.originalFilename)
			return -1;
		if (a.originalFilename > b.originalFilename)
			return 1;
		return 0;
	});

	return fileList;
}

function constructQuestionForFileList(fileList) {
	var choices = [];
	for (var i in fileList) {
		choices.push({
			name: fileList[i].originalFilename,
			value: fileList[i].actualFilename
		});
	}
	var question = [{
		name: 'question',
		type: 'checkbox',
		message: 'Choose File(s)',
		choices: choices,
		default: 0
	}];
	return question;
}

const questionWhatToDo = [{
	name: 'whatToDo',
	type: 'list',
	message: 'What would you have me do?',
	choices: [
		{
			name: 'View Files / Decrypt',
			value: 'decrypt'
		},
		{
			name: 'Encrypt Everything',
			value: 'encrypt'
		},
		{
			name: 'Delete Files',
			value: 'delete'
		},
		{
			name: 'Test Encryption of Filenames',
			value: 'testFilenameEncryption'
		}
	],
	default: 0
}];

const questionPassword = [{
	name: 'password',
	type: 'input', // 'password' is an option too but yeah
	message: 'Password:'
}];

const questionDeleteOriginals = [{
	name: 'deleteOriginals',
	type: 'list',
	message: 'Delete originals after encryption?',
	choices: [
		{
			name: 'Yes',
			value: true
		},
		{
			name: 'No',
			value: false
		}
	],
	default: 0
}];

inquirer.prompt(questionPassword).then(answer => {
	pooswood = answer.password;

	inquirer.prompt(questionWhatToDo).then(answer => {
		var whatToDo = answer.whatToDo;

		if (whatToDo == 'decrypt') {
			var fileList = createFileList();
			//console.log(fileList);
			var question = constructQuestionForFileList(fileList);

			inquirer.prompt(question).then(answer => {
				var originalFilenames = answer.question;

				for (var i in originalFilenames) {
					dekryptFile(originalFilenames[i]);
				}
			});

		} else if (whatToDo == 'encrypt') {

			inquirer.prompt(questionDeleteOriginals).then(answer => {
				deleteOriginals = answer.deleteOriginals;

				for (var i in folders) {
					enkryptFolder(folders[i]);
				}
			});

		} else if (whatToDo == 'delete') {
			console.log('Remove file and from log.. [TO DO]');

		} else if (whatToDo == 'testFilenameEncryption') {
			testFilenameEncryption();
		}
	});
});



// Extract, with full paths (x not e) so /Public contains just flat files
// which actually extract out to their original folder paths
// 7z x -pmypassword Public\addams.mdata
// UPDATE: this can also be handled exclusively by dekrypt.bat
