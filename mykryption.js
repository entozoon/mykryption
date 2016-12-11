/*jshint -W041 */
clearScreen('\n');
console.log('  ******************************************************************************');
console.log('  *                                                                            *');
console.log('  * Mykryption - The (poorly named) cryption service                           *');
console.log('  * Compiles (with paths) all folders in parent directory ending with [mykrypt] *');
console.log('  *                                                                            *');
console.log('  ******************************************************************************');

process.chdir('../');
console.log('  Running from ' + process.cwd());

var folders = [];
const crypts = require('./crypts.js'),
	inquirer = require('inquirer'),
	fs = require('fs'),
	glob = require('glob'),
	path = require('path'),
	exec = require('child_process').execSync;

var log = './Public/mykryption.log.json';
var pooswood = 'not-hard-coded-because-thats-retarded';
var deleteOriginals;

var folders = getEnkryptFolders();

backupEnkryptionLog();
return;
try {
	fs.accessSync(log, fs.F_OK);
	var enkryptionLog = JSON.parse(fs.readFileSync(log, 'utf8'));
} catch (e) {
	var enkryptionLog = {};
}

function testFilenameEncryption() {
	// TEST FILENAME ENKRYPTIONS
	console.log('\n  ************************ Testing Enkryptions Real Quick **********************');
	var filenameTest = 'My.Mytrax.1891.167p HPCD.X112-nhs.mppg3';
	console.log('Original filename:');
	console.log(filenameTest);
	console.log('\nLogged filename (enkrypted):');
	console.log(crypts.enkrypt(filenameTest, 'poswodtest'));
	console.log('\nLogged filename (dekrypted):');
	console.log(crypts.dekrypt(crypts.enkrypt(filenameTest, 'ciphertest'), 'ciphertest'));
	console.log('\nActual filename (befuddled):');
	console.log(crypts.befuddle(filenameTest) + '.mdata.001');
	console.log('  ******************************************************************************');
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
			/*
			// If not .bat, .js or enkrypted file
			// Update: Removing as this was for when it compiled mykryption dir
			if (file.substr(-4) != '.bat' &&
				file.substr(-3) != '.js' &&
				file.substr(-6) != '.mdata'
			) {
			*/
			//process.stdout.write('.');

			var befuddled = crypts.befuddle(file);

			// Output to log
			enkryptionLog[crypts.enkrypt(folder + '/' + file, pooswood)] = befuddled + '.mdata.001';
			enkryptionLogWrite();

			// if previously enkrypted
			if (fs.existsSync('Public\\' + befuddled + '.mdata.001')) {
				console.log(' ' + file + '\n is already enkrypted as:\n ' + befuddled + '.mdata.001\n');
				// [TO DO] Offer the ability to delete the original file here
			} else {
				/*  7z
					a            Add File
					-mx0         No compression
					-mhe=on      Filename enkryption
					-mmt=on      Enable multithreading
					-v100m       Split into file chunks (e.g. 100mb)
					-sdel        Delete after compression!
					-p[password]
					output
					input

					7z a -mx0 -mhe=on -mmt=on -pmypassword dwa.mp4.mdata dwa.mp4
				*/
				var zdelete = '';
				if (deleteOriginals) zdelete = '-sdel ';

				// Enkrypt file
				execAndLog('7z a -mx0 -mhe=on -mmt=on -v100m ' + zdelete + '-p' + pooswood + ' "Public\\' + befuddled + '.mdata" "' + folder + '\\' + file + '"');
			}
			console.log('*******************************************************************************');
		});
	}
}

function dekryptFile(filename) {
	// 7z x -y -bb1 -p%pass% %1
	execAndLog('7z x -y -bb1 -p' + pooswood + ' ' + filename);
}

function deleteFile(file) {
	console.log(file.originalFilename);
	console.log(crypts.enkrypt(file.originalFilename, pooswood));
	console.log(file.actualFilename);

	if (fs.existsSync(file.actualFilename)) {
		console.log(' Deleting file(s):');
		//fs.unlinkSync(file.actualFilename); // pre-chunking
		if (file.actualFilename.substr(-4) == '.001') { // which it totally will do
			var filenamePreChunk = file.actualFilename.substr(0, file.actualFilename.length - 4);
			//console.log(filenamePreChunk + '.*');
			glob(filenamePreChunk + ".*", function(err, files) {
				if (err) {
					console.log(' Error when deleting file:');
					console.log(err);
				} else {
					// .mdata.001, .mdata.002, ..
					for (var i in files) {
						console.log(files[i]);
						fs.unlinkSync(files[i]);
					}
					delete enkryptionLog[crypts.enkrypt(file.originalFilename, pooswood)];
					enkryptionLogWrite();
					console.log(' Removed from log.');
				}
			});
		} else {
			console.log(" Couldn't understand file type:");
			console.log(file.actualFilename);
		}
	} else {
		console.log(" Couldn't find file:");
		console.log(file.actualFilename);
	}
}

function createFileList() {
	try {
		fs.accessSync(log, fs.F_OK);
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

	} catch (e) {
		console.log("Couldn't find the log file " + log);
		return false;
	}
}

const questionWhatToDo = [{
	name: 'whatToDo',
	type: 'list',
	message: 'What would you have me do?',
	choices: [
		{
			name: 'Explore Files',
			value: 'explore'
		},
		{
			name: "Encrypt All '[mykrypt]' folders in parent",
			value: 'encrypt'
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

function constructQuestionForFileList(fileList) {
	var choices = [];
	for (var i in fileList) {
		choices.push({
			name: fileList[i].originalFilename,
			value: {
				originalFilename: fileList[i].originalFilename,
				actualFilename: fileList[i].actualFilename
			}
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

const questionSelectedFiles = [{
	name: 'question',
	type: 'list',
	message: 'What shall we do with those files?',
	choices: [
		{
			name: 'Decrypt',
			value: 'decrypt'
		},
		{
			name: 'Delete',
			value: 'delete'
		}
	],
	default: 0
}];

console.log('');
inquirer.prompt(questionPassword).then(answer => {
	pooswood = answer.password;

	clearScreen('\n');
	inquirer.prompt(questionWhatToDo).then(answer => {
		var whatToDo = answer.whatToDo;

		if (whatToDo == 'explore') {
			var fileList = createFileList();
			if (fileList) {
				clearScreen('\n');
				console.log('  ******************************************************************************');
				console.log('  * File List                                                                  *');
				console.log('  * Choose files and press enter for further options.                          *');
				console.log('  ******************************************************************************');
				//console.log(fileList);
				var question = constructQuestionForFileList(fileList);

				console.log('');
				inquirer.prompt(question).then(answer => {
					if (answer.question.length == 0) {
						console.log("  You didn't select any files! Hit space to select things.");
						// [TO DO] Go back to start of menu system
						return;
					}
					var files = answer.question;

					console.log('');
					inquirer.prompt(questionSelectedFiles).then(answer => {
						if (answer.question == 'decrypt') {
							for (var i in files) {
								dekryptFile(files[i].actualFilename);
							}
						} else if (answer.question == 'delete') {
							for (var i in files) {
								deleteFile(files[i]);
							}
						}
					});
				});
			}
		} else if (whatToDo == 'encrypt') {
			clearScreen('\n');
			inquirer.prompt(questionDeleteOriginals).then(answer => {
				clearScreen('\n');
				deleteOriginals = answer.deleteOriginals;

				if (!folders.length) {
					console.log(' No folders found in parent directory ending with [mykript]');
				}

				console.log(' Folders found:');

				for (var i in folders) {
					console.log(' ' + folders[i]);
				}
				console.log('');

				for (var i in folders) {
					try {
						fs.accessSync(folders[i], fs.F_OK);
						enkryptFolder(folders[i]);
					} catch (e) {
						console.log('No such folder: ' + process.cwd() + '/' + folders[i]);
					}
				}
			});
		} else if (whatToDo == 'testFilenameEncryption') {
			testFilenameEncryption();
		}
	});
});

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}

function getEnkryptFolders() {
	var foldersAll = getDirectories('.');
	var foldersEnkrypt = [];
	for (var i in foldersAll) {
		if (foldersAll[i].substr(-9) == '[mykrypt]') {
			foldersEnkrypt.push(foldersAll[i]);
		}
	}
	return foldersEnkrypt;
}

function clearScreen(append) {
	process.stdout.write('\033c'); // clear
	if (append != null) {
		process.stdout.write(append);
	}
}

function backupEnkryptionLog() {
	// ISO date plug full date value as a integer; so cray precise.
	var d = new Date();
	console.log(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '_' + new Date().valueOf());
	//fs.createReadStream(log).pipe(fs.createWriteStream(log + 'dwa'));
}

function enkryptionLogWrite() {
	fs.writeFile(
		log,
		JSON.stringify(enkryptionLog, null, 4),
		function(err) {
			if (err != null) {
				console.log('To err is human: ' + err);
			}
		}
	);
}

// Extract, with full paths (x not e) so /Public contains just flat files
// which actually extract out to their original folder paths
// 7z x -pmypassword Public\addams.mdata
// UPDATE: this can also be handled exclusively by dekrypt.bat
