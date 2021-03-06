var prettyBytes = require('pretty-bytes')
var relativeDate = require('relative-date')
var abort = require('../lib/util/abort.js')
var openDat = require('../lib/util/open-dat.js')
var usage = require('../lib/util/usage.js')('checkout.txt')

module.exports = {
  name: 'status',
  command: handleStatus
}

function handleStatus (args) {
  if (args.help) return usage()

  openDat(args, function (err, db) {
    if (err) abort(err, args)

    db.status(function (err, status) {
      if (err) abort(err, args)

      // dat-core calls it head, we wanna call it version instead
      status.version = status.head
      delete status.head

      var datasets = status.datasets
      // we subtract 1 since we don't want to count the 'files' dataset
      // and there always is a files dataset because of package.json
      if (datasets) datasets--

      var rows = status.rows
      if (status.files) rows -= status.files

      if (args.json) {
        console.log(JSON.stringify(status))
      } else {
        var output = ''
        output += 'Current version is ' + status.version
        if (!status.checkout) output += ' (latest)\n'
        else output += ' (checkout)\n'
        output += datasets + ' ' + pluralize('dataset', datasets) + ', '
        output += rows + ' ' + pluralize('key', rows) + ', ' + status.files + ' ' + pluralize('file', status.files) + ', '
        output += status.versions + ' ' + pluralize('version', status.versions) + ', ' + prettyBytes(status.size) + ' total\n'
        output += 'Last updated ' + relativeDate(status.modified) + ' (' + status.modified + ')'
        console.error(output)
        db.close()
      }
    })
  })
}

function pluralize (name, cnt) {
  return cnt === 1 ? name : name + 's'
}
