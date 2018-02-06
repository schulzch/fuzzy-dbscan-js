import marked = require('marked');
import fs = require('fs');
import {should} from 'chai';
import {FuzzyDBSCAN} from '../src/fuzzy-dbscan';

function parseCodeBlocks(tokens) {
  return tokens
    .filter((token) => token.type === 'code' && token.lang === 'javascript')
    .map((token) => token.text);
};

describe('README.md', function() {
  const readme = fs.readFileSync(__dirname + '/../README.md', 'utf8');
  const codeBlocks = parseCodeBlocks(marked.lexer(readme));
  
  for (const [index, codeBlock] of codeBlocks.slice(1).entries()) {
    (function(codeBlock, index) {
      it('example no. ' + (index + 1) + ' should work', function() {
        const oldConsoleLog = console.log;
        console.log = function() {};
        try {
          eval(codeBlock);
        } catch (error) {
          throw error;
        } finally {
          console.log = oldConsoleLog;
        }
      });
    })(codeBlock, index);
  }
});
