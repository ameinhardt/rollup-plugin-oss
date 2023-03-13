import { getLicenses } from '../index.js';

const possibleValues = [
  {
    type: 'ISC',
    url: 'https://opensource.org/licenses/ISC'
  },
  42,
  'MIT OR GPL-2.0 AND ISC',
  'BSD-3-Clause',
  '(MIT AND (LGPL-2.1+ AND BSD-3-Clause WITH GPL-3.0-linking-exception))',
  '(ISC OR (GPL-2.0+))',
  'See LICENSE.md'
];

describe('gets licenses from package attribute', function() {
  for (const [index, value] of possibleValues.entries()) {
    it(`#${index + 1} ${typeof value === 'string' ? value : 'object' }`, function() {
      try {
        const licenses = getLicenses(value as string | Record<string, string>);
        expect(licenses).toMatchSnapshot();
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  }
});
