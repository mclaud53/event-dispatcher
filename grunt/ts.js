module.exports = {
    test: {
        files: [
            {src: ['src/**/*.ts'], dest: 'out'},
            {src: ['test/**/*.ts'], dest: 'out'}
        ],
        options: {
            fast: 'newer',
            module: 'commonjs',
            target: 'es5',
            comments: false,
            declaration: false,
            sourceMap: false
        }
    },
    buildNode: {
        files: [
            {src: ['src/**/*.ts'], dest: 'js'}
        ],
        options: {
            fast: 'newer',
            module: 'commonjs',
            target: 'es5',
            comments: false,
            declaration: false,
            sourceMap: false
        }
    },
    buildBower: {
        files: [
            {src: ['src/**/*.ts'], dest: 'event-dispatcher.js'}
        ],
        options: {
            fast: 'newer',
            module: 'amd',
            target: 'es5',
            comments: true,
            declaration: true,
            rootDir: 'src',
            sourceMap: false
        }
    }
};