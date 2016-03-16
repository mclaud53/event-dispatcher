'use strict';

module.exports = function (grunt) {
    // Load grunt tasks automatically
    grunt.loadNpmTasks('grunt-notify');

    require('load-grunt-config')(grunt, {
        jitGrunt: {
        }
    });
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.registerTask('test', [
        'clean:default',
        'typings:default',
        'ts:default',
        'mochaTest:test'
    ]);

    grunt.registerTask('build', [
        'clean:default',
        'typings:default',
        'ts:default',
        'mochaTest:test',
        'uglify:default'
    ]);

    grunt.registerTask('default', [
        'clean:default',
        'typings:default',
        'ts:default',
        'watch'
    ]);
};