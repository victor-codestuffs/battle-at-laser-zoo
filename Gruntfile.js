module.exports = function(grunt) {

  var port = 1337;

  require( 'load-grunt-tasks' )( grunt );

  grunt.initConfig({
    connect: {
      server: {
        options: { port: port }
      },
      start: {
        options: {
          port: port,
          open: 'http://localhost:<%= connect.server.options.port %>/'
        },
        app: 'Google Chrome'
      }
    },
    watch: {
      options: { livereload: true },
      js: {
        files: ['js/game.js', 'js/config.json'],
        options: { spawn: false }
      },
      html: {
        files: ['index.html'],
        options: { spawn: false }
      }
    }
  });

  grunt.registerTask('start', ['connect:start', 'watch']);
  grunt.registerTask('default', ['connect:server','watch']);
  
};