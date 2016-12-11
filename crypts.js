var crypto = require('crypto');
const revealness = 10;
var vowels = ['a','e','i','o','u'];
var consonants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'];

module.exports = {
	/**
	 * My.Mytrix.1994.1067p.HDDVD.X262-hv.mk3 -> msysmsyatsrsiaxs199-_366067210
	 * Unique filename that can't be wholly reverse engineered
	 */
	befuddle: function(filename) {
		console.log('\n  ' + filename + ' -->');
		var befuddled = '';
		for (var i in filename) {
			if (i < revealness) {
				if (vowels.indexOf(filename[i].toLowerCase()) != -1) {
					befuddled += filename[i].toLowerCase();
					if (filename[i].toLowerCase() != 'a') {
						befuddled += 'a';
					}
				} else if (consonants.indexOf(filename[i].toLowerCase()) != -1) {
					befuddled += filename[i].toLowerCase();
					if (filename[i].toLowerCase() != 's') {
						befuddled += 's';
					}
				} else if (filename[i].isInt()) {
					befuddled += filename[i]; // yolo it in
				}
				console.log('  ' + befuddled);
			}
		}
		befuddled += '_' + filename.hashCode();
		console.log('  ' + befuddled + ' <--\n');
		return befuddled;
	},

	/**
	 * Obfuscate string in a reversable way, based on a cipher
	 * i.e. encryption for the log json
	 */
	enkrypt: function(string, cipher) {
		// Nodejs encryption with CTR
		// https://github.com/chris-rock/node-crypto-examples/blob/master/crypto-ctr.js
		var algorithm = 'aes-256-ctr';

		cipher = crypto.createCipher(algorithm, cipher);
		var crypted = cipher.update(string, 'utf8', 'hex');
		crypted += cipher.final('hex');
		return crypted;

		/*
		function decrypt(string){
			var decipher = crypto.createDecipher(algorithm, cipher)
			var dec = decipher.update(string,'hex','utf8')
			dec += decipher.final('utf8');
			return dec;
		}
		*/
	},

	dekrypt: function(string, cipher) {
		var algorithm = 'aes-256-ctr';

		var decipher = crypto.createDecipher(algorithm, cipher)
		var decrypted = decipher.update(string, 'hex', 'utf8')
		decrypted += decipher.final('utf8');
		return decrypted;
	}
};

String.prototype.hashCode = function() {
	var hash = 0, i, chr, len;
	if (this.length === 0) return hash;
	for (i = 0, len = this.length; i < len; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

// Uses only the first character of whatever's passed #lolsocksz0ry0lo
String.prototype.isInt = function() {
	var n = ~~Number(this[0]);
	return String(n) === this[0] && n >= 0;
}
