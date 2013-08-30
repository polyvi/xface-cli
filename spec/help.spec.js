var xface = require('../xface');

describe('help command', function() {
    it('should emit a results event with help contents', function(done) {
        this.after(function() {
            xface.removeAllListeners('results');
        });
        xface.on('results', function(h) {
            expect(h).toMatch(/synopsis/gi);
            done();
        });
        xface.help();
    });
});
