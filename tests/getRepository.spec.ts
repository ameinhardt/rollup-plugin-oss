import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getRepository } from '../src/index';

// https://docs.npmjs.com/cli/v8/configuring-npm/package-json#repository
const possibleValues = [
    'npm/npm',
    'github:user/repo',
    'gist:11081aaa281',
    'bitbucket:user/repo',
    'gitlab:user/repo',
    42,
    {
      type: 'git',
      url: 'https://github.com/npm/cli.git'
    },
    {
      directory: 'packages/react-dom',
      type: 'git',
      url: 'https://github.com/facebook/react.git'
    }
  ],
  expectValues = ['https://github.com/npm/npm', 'https://github.com/user/repo', 'https://gist.github.com/11081aaa281', 'https://bitbucket.org/user/repo', 'https://gitlab.com/user/repo', ``, 'https://github.com/npm/cli', 'https://github.com/facebook/react'];

describe('gets a respository url from package attribute', () => {
  for (const [index, value] of possibleValues.entries()) {
    it(`#${index + 1} ${typeof value === 'string' ? value : 'object'}`, () => {
      const repository = getRepository(value as string);
      assert(typeof repository === 'string');
      assert.equal(repository, expectValues[index]);
    });
  }
});
