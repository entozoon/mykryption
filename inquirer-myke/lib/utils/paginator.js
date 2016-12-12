'use strict';

var _ = require('lodash');
var chalk = require('chalk');

/**
 * The paginator keep trakcs of a pointer index in a list and return
 * a subset of the choices if the list is too long.
 */

var Paginator = module.exports = function () {
  this.pointer = 0;
  this.lastIndex = 0;
};

Paginator.prototype.paginate = function (output, active, pageSize) {
  pageSize = pageSize || 7;
  var lines = output.split('\n');

  // Make sure there's enough lines to paginate
  if (lines.length <= pageSize + 2) {
    return output;
  }
/*
  // Move the pointer only when the user go down and limit it to 3
  //if (this.pointer < 3 && this.lastIndex < active && active - this.lastIndex < 9) {
  if (this.pointer < (pageSize / 2)) {
    //this.pointer = Math.min(3, this.pointer + active - this.lastIndex);
    this.pointer = this.pointer + active - this.lastIndex;
  }
	*/
  if (active > 0 && active < Math.ceil(pageSize / 2)) {
    this.pointer = this.pointer + active - this.lastIndex;
  }

  if (this.pointer > lines.length - 1) {
    this.pointer = lines.length - 1;
  }

  this.lastIndex = active;

  //var topIndex = Math.max(0, active + lines.length - this.pointer);
  //var topIndex = Math.max(lines.length, active + lines.length - this.pointer);
  var topIndex = active + lines.length - pageSize / 2;// - this.pointer;
  // This is entirely empirical!
  //var maxTopIndex = lines.length - 1 + Math.ceil((pageSize - 1) / 2) * 2
  var maxTopIndex = lines.length * 2 - pageSize;
  //maxTopIndex = 120; // this needs to be exactly 120 (on my laptop)
  // and I can't figure out how
  if (topIndex > maxTopIndex) {
    topIndex = maxTopIndex;
  }

  //outputToLines(lines, this.pointer + ' ' + active + ' ' + lines.length);
  //outputToLines(lines, topIndex + ' ' + maxTopIndex);
  //outputToLines(lines, topIndex + ' ' + lines.length + ' ' + pageSize);
  outputToLines(lines, active + ' ' + topIndex + ' ' + maxTopIndex + ' ' + pageSize + ' ' + lines.length);

  // Duplicate the lines so it give an infinite list look
  var infinite = _.flatten([lines, lines, lines]);
  //var infinite = _.flatten([lines, lines]);

  var section = infinite.splice(topIndex, pageSize).join('\n');
  return section + '\n' + chalk.dim('(Move up and down to reveal more choices)');
};

function outputToLines(lines, str) {
	for (var i = 0; i < lines.length; i ++) {
		lines[i] = str + ': ' + lines[i];
	}
	return lines;
}
