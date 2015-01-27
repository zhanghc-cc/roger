var Q       = require('q');
var spawn   = require('child_process').spawn;
var logger  = require("./logger");
var utils   = require("./utils");
var git     = {};

/**
 * Clones the repository at the specified path,
 * only fetching a specific branch -- which is
 * the one we want to build.
 * 
 * @return promise
 */
git.clone = function(repo, path, branch) {
  logger.info('Cloning %s:%s in %s', utils.obfuscateString(repo), branch, path);
  var deferred = Q.defer();
  var clone    = spawn('git', ['clone', '-b', branch, '--single-branch', repo, path]);

  clone.stdout.on('data', function (data) {
    logger.info('git clone %s: %s', utils.obfuscateString(repo), data.toString());
  });
  
  /**
   * Git gotcha, the output of a 'git clone'
   * is sent to stderr rather than stdout
   * 
   * @see http://git.661346.n2.nabble.com/Bugreport-Git-responds-with-stderr-instead-of-stdout-td4959280.html
   */
  clone.stderr.on('data', function (err) {
    logger.info('git clone %s: %s', utils.obfuscateString(repo), err.toString());
  });
  
  clone.on('close', function (code) {
    if (code === 0) {
      deferred.resolve();
    } else {
      deferred.reject('child process exited with status ' + code);
    }
  });
  
  return deferred.promise;
}

module.exports = git;