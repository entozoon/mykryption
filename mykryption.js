/*jshint -W041 */
var debugging = false;
const header = '\n  ********************************************************************************\n\
  *  Mykryption                                                                  *\n\
  ********************************************************************************\n\n'
const intro = header.substr(0, header.length - 1	) + '\
  *  The (poorly named) cryption service.                                        *\n\
  *  Compiles, with paths, all folders in parent directory ending with [mykrypt] *\n\
  ********************************************************************************\n';
console.log(intro); // not clearScreen as, when it resets, it's annoying

process.chdir('../');
console.log('  Running from ' + process.cwd());

var folders = [];
const crypts = require('./crypts.js'),
	inquirer = require('./inquirer-myke'),
	mkdirp = require('mkdirp'),
	getDirName = require('path').dirname,
	fs = require('fs'),
	glob = require('glob-promise'),
	path = require('path'),
	exec = require('child_process').execSync;

// [TO DO] Put all variables as a .json file or better yet, saved inquirer input
var log = './Public/mykryption_log/mykryption.log.json';
var publicDir = './Public'; // from POV of parent with the chdir above
var pooswood = 'not-hard-coded-because-thats-retarded';
var deleteOriginals;

var folders = getEnkryptFolders();

try {
	fs.accessSync(log, fs.F_OK);
	// Load
	var enkryptionLog = JSON.parse(fs.readFileSync(log, 'utf8'));
	// Backup (only if it exists)
	backupEnkryptionLog();
} catch(err) {
	console.log("\n  No log file found, or it was corrupt (don't panic):");
	//console.log(err);
	var enkryptionLog = {};
	console.log('  Creating a new one.'); // [TO DO] Make this an optional step, likely unwanted tbh
	enkryptionLogWrite();
}

function exitHandler(bleh, restart) {
	console.log(restart);
	if (restart) {
		console.log('RESTARTTTTT');
		return;
	}
}
// natural exit
process.on('exit', exitHandler.bind(null, true));

// ctrl-c
process.on('SIGINT', exitHandler.bind(null, false));

// uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, false));

// ******************************** //

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
			name: 'No',
			value: false
		},
		{
			name: 'Yes',
			value: true
		}
	],
	default: 0
}];

function constructQuestionForFileList(fileList) {
	var pageSize = process.stdout.getWindowSize(1)[1] - 15;
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
		default: 0,
		pageSize: pageSize
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


function main() {
	console.log('');
	inquirer.prompt(questionPassword).then(answer => {
		pooswood = answer.password;

		clearScreen(header);
		inquirer.prompt(questionWhatToDo).then(answer => {
			var whatToDo = answer.whatToDo;

			if (whatToDo == 'explore') {
				var fileList = createFileList();
				if (!fileList.length) {
					console.log('\n  There are no files in the log! Is that right?\n\n  To regenerate the log file, you can try your luck re-encrypting\n  but that\'ll only work if you have the original files.\n  Otherwise grab a shovel and dig through the backup logs.');
					return; //main(); // return to start
				}

				clearScreen('\n');
				console.log('  *****************************************************');
				console.log('  * File List                                         *');
				console.log('  * Choose files and press enter for further options. *');
				console.log('  *****************************************************');
				//console.log(fileList);
				var question = constructQuestionForFileList(fileList);

				console.log('');
				inquirer.prompt(question).then(answer => {
					if (answer.question.length == 0) {
						console.log("  You didn't select any files! Hit space to select things.");
						// [TO DO] Go back to start of menu system
						return; //main(); // return to start
					}
					var files = answer.question;

					console.log('');
					inquirer.prompt(questionSelectedFiles).then(answer => {
						if (answer.question == 'decrypt') {
							for (var i in files) {
								dekryptFile(files[i].actualFilename);
							}
						} else if (answer.question == 'delete') {
							//console.log('  \nFair warning, this runs asynchronously so the output here may be billy bonkers.. (if all console logs are visible) \n');

							// File deletes all happen asynchronously, but thanks to Promise.all
							// They only run the .then() further down when they've all finished.

							// Create a promise for the batch of file deletions
							let fileDeletions = files.map((file) => {
								return new Promise((resolve) => {
									// Run deleteFile() for each file, passing resolve() through to let it resolve inside there
									deleteFile(file, resolve);
								});
							});

							// After all the deletes have finished deletificating
							Promise.all(fileDeletions).then(() => {
								console.log('\n  All files deleted');
								console.log('  Writing to log\n');
								enkryptionLogWrite();
								return; //main(); // return to start
							});
						}
					});
				});
			} else if (whatToDo == 'encrypt') {
				clearScreen(header);
				inquirer.prompt(questionDeleteOriginals).then(answer => {
					clearScreen(header);
					deleteOriginals = answer.deleteOriginals;

					if (!folders.length) {
						console.log('  No folders found in parent directory ending with [mykrypt]');
						return;
					}

					clearScreen('\n');
					console.log('  *********************************************************');
					console.log('  * Encrypting Files                                      *');
					console.log("  * PLEASE WAIT until it's finished or it'll bork the log *");
					console.log('  *********************************************************\n');

					console.log('  Folders found:');

					for (var i in folders) {
						console.log('  ' + folders[i]);
					}

					for (var i in folders) {
						try {
							fs.accessSync(folders[i], fs.F_OK);
							enkryptFolder(folders[i]);
						} catch (err) {
							console.log('  Problem with folder:\n  ' + process.cwd() + '\\' + folders[i]);
							console.log(err);
						}
					}
				});
			} else if (whatToDo == 'testFilenameEncryption') {
				testFilenameEncryption();
				return; //main(); // return to start
			}
		});
	});
}


main();


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

			// Output to log (unwritte)
			enkryptionLog[crypts.enkrypt(folder + '/' + file, pooswood)] = befuddled + '.mdata.001';

			// if previously enkrypted
			if (fs.existsSync(publicDir + '/' + befuddled + '.mdata.001')) {
				console.log('  ' + file + '\n  is already enkrypted as:\n  ' + befuddled + '.mdata.001');
				// [TO DO] Offer the ability to delete the original file here
			} else {
				/*  7z
					a            Add File
					-mx0         No compression
					-mhe=on      Filename enkryption
					-mmt=on      Enable multithreading
					-v2000m      Split into file chunks (e.g. 2000mb) (AD has 50gb max)
					-sdel        Delete after compression!
					-p[password]
					output
					input

					7z a -mx0 -mhe=on -mmt=on -pmypassword dwa.mp4.mdata dwa.mp4
				*/
				var zdelete = '';
				if (deleteOriginals) zdelete = '-sdel ';

				// Enkrypt file
				try {
					execAndLog('7z a -mx0 -mhe=on -mmt=on -v2000m ' + zdelete + '-p' + pooswood + ' "' + publicDir + '/' + befuddled + '.mdata" "' + folder + '\\' + file + '"');
				} catch(err) {
					console.log(err);
				}
			}
			console.log('\n*********************************************************************************');
		});

		// [TO DO] Put this files.foreach in a promise too ?
		// It may sometimes corrupts the log file when encrypting
		// However, placing it here seems to be okay.. it doesn't actual write til the end(?)
		console.log('\n  Writing to log\n');
		enkryptionLogWrite();
		backupEnkryptionLog();
		return; //main(); // return to start
	}
}

function dekryptFile(filename) {
	// 7z x -y -bb1 -p%pass% %1
	execAndLog('7z x -y -bb1 -p' + pooswood + ' ' + filename);
}

/**
 * deleteFile
 * Deletes physical file and removes from the log
 * It runs asynchronously with the glob, so console log is a bit strange
 * but seems to do the trick just fine providing enkryptionLogWrite runs afterward
 */
function deleteFile(file, resolve) {
	//console.log('\n  Looking for file:');
	//console.log(file.originalFilename);
	//console.log(file.actualFilename);
	//console.log(crypts.enkrypt(file.originalFilename, pooswood));er on

	if (fs.existsSync(file.actualFilename)) {
		if (file.actualFilename.substr(-4) == '.001') { // (which it totally will do)
			var filenamePreChunk = file.actualFilename.substr(0, file.actualFilename.length - 4);
			//console.log(filenamePreChunk + '.*');

			// .mdata.001, .mdata.002, ..
			glob(filenamePreChunk + ".*")
				.then(function(files) {
					//console.log('\n  Deleting file(s):');
					var fileLoop = Promise.all(files.map(function(f) {
						// Delete file:
						//console.log(f);
						fs.unlinkSync(f);
					})).then(function() {
						console.log('\n  Deleted files..');
						console.log(file.originalFilename);
						files.forEach(function(f) {
							console.log(f);
						});
						// Remove from log:
						delete enkryptionLog[crypts.enkrypt(file.originalFilename, pooswood)];
						console.log('  .. And removed from log (unwritten)');

						resolve(); // All done?
					});
				});
		} else {
			console.log("  Couldn't understand file type:");
			console.log(file.actualFilename);
		}
	} else {
		console.log(" Couldn't find file:");
		console.log(file.actualFilename);
	}
}

/*
function deleteFileInAShitWay(file) {
	console.log('\n  Looking for file:');
	console.log(file.originalFilename);
	console.log(file.actualFilename);
	console.log(crypts.enkrypt(file.originalFilename, pooswood));

	if (fs.existsSync(file.actualFilename)) {
		//fs.unlinkSync(file.actualFilename); // pre-chunking
		if (file.actualFilename.substr(-4) == '.001') { // which it totally will do
			var filenamePreChunk = file.actualFilename.substr(0, file.actualFilename.length - 4);
			//console.log(filenamePreChunk + '.*');

			// .mdata.001, .mdata.002, ..
			glob(filenamePreChunk + ".*")
				.then(function(files) {
					console.log('\n  Deleting file(s):');
					var fileLoop = Promise.all(files.map(function(f) {
						// Delete file:
						console.log(f);
						fs.unlinkSync(f);
					})).then(function() {
						// Remove from log:
						delete enkryptionLog[crypts.enkrypt(file.originalFilename, pooswood)];
						console.log('\n  Removing from log (unwritten).\n');
					});
				});

//			glob(filenamePreChunk + ".*", function(err, files) {
//				if (err) {
//					console.log('  Error when deleting file:');
//					console.log(err);
//				} else {
//
//					var fileLoop = Promise.all(files.map(function(f) {
//						// Delete file:
//						console.log(f);
//						fs.unlinkSync(f);
//					})).then(function() {
//						// Remove from log:
//						delete enkryptionLog[crypts.enkrypt(file.originalFilename, pooswood)];
//						console.log('\n  Removing from log.\n');
//						enkryptionLogWrite();
//					});



//					var sequence = Promise.resolve();
//					// .mdata.001, .mdata.002, ..
//					files.forEach(function(f) {
//						// Add these actions to the end of the sequence
//						sequence = sequence.then(function() {
//							// Delete file:
//							console.log(f);
//							fs.unlinkSync(f);
//						});
//					}).then(function() {
//
//						// Remove from log:
//						delete enkryptionLog[crypts.enkrypt(file.originalFilename, pooswood)];
//						console.log('\n  Removing from log.\n');
//						enkryptionLogWrite();
//
//					});
//

				}
			});
		} else {
			console.log("  Couldn't understand file type:");
			console.log(file.actualFilename);
		}
	} else {
		console.log(" Couldn't find file:");
		console.log(file.actualFilename);
	}
}
*/

function createFileList() {
	try {
		fs.accessSync(log, fs.F_OK);
		var enkryptionLog = JSON.parse(fs.readFileSync(log, 'utf8'));
		var fileList = [];
		for (var enkrypted in enkryptionLog) {
			fileList.push({
				'originalFilename': crypts.dekrypt(enkrypted, pooswood),
				'actualFilename': publicDir + '/' + enkryptionLog[enkrypted]
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

// e.g. clearScreen(header) or clearScreen('\n')
function clearScreen(append) {
	if (!debugging) {
		process.stdout.write('\033c'); // clear
	}
	if (append != null) {
		process.stdout.write(append);
	}
}

function backupEnkryptionLog() {
	// ISO date plug full date value as a integer; so cray precise.
	var d = new Date();
	var append = '.backup_previous_' + d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
	append += '_' + new Date().valueOf();
	var backupFilename = log + append;
	console.log('\n  Backing up encryption log to:\n  ' + backupFilename);
	fs.createReadStream(log).pipe(fs.createWriteStream(backupFilename));
}

function enkryptionLogWrite() {
	//console.log('Writing to log:');
	//console.log(JSON.stringify(enkryptionLog, null, 4));
	//console.log('');
	writeFile(
		log,
		JSON.stringify(enkryptionLog, null, 4),
		function(err) {
			if (err != null) {
				console.log('To err is human: ' + err);
			}
		}
	);
}

/**
 * writeFile
 * Writes to file similar to fs.writeFile but creates all necessary directories too
 */
function writeFile(path, contents, cb) {
	mkdirp(getDirName(path), function (err) {
		if (err) return cb(err);
		fs.writeFile(path, contents, cb);
	});
}

// Extract, with full paths (x not e) so /Public contains just flat files
// which actually extract out to their original folder paths
// 7z x -pmypassword Public\addams.mdata
// UPDATE: this can also be handled exclusively by this app / dekrypt.bat / dekrypt.exe
