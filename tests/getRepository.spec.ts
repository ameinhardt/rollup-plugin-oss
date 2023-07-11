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
    type: 'git',
    url: 'https://github.com/facebook/react.git',
    directory: 'packages/react-dom'
  }];

describe('gets a respository url from package attribute', function() {
  for (const [index, value] of possibleValues.entries()) {
    it(`#${index + 1} ${typeof value === 'string' ? value : 'object' }`, function() {
      try {
        const repository = getRepository(value as string);
        expect(typeof repository).toBe('string');
        expect(repository).toMatchSnapshot();
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  }
});
