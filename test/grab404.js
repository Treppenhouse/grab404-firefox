const calculateOutputFilename = require('../grab404').calculateOutputFilename;
const assert = require('assert')

describe('Calculate Output Filename', function() {
    it('wikipedia.org', function() {
        let actual = calculateOutputFilename('wikipedia.org', 0, 'out');
        assert.equal(actual, 'out/00.wikipedia.org.png')
    })
})