import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getLicenses } from '../src/index';

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
  ],
  expectedResults = [
    { infos: [{ license: 'ISC' }], license: 'ISC' },
    'TypeError: can\'t parse license',
    'Error: can\'t unambiguously parse license definition',
    { infos: [{ license: 'BSD-3-Clause' }], license: 'BSD-3-Clause' },
    {
      infos: [
        { exception: 'GPL-3.0-linking-exception', license: 'BSD-3-Clause' },
        { license: 'LGPL-2.1', plus: true },
        { license: 'MIT' }
      ],
      license: '(MIT AND (LGPL-2.1+ AND BSD-3-Clause WITH GPL-3.0-linking-exception))'
    },
    'Error: found multiple license options',
    'Error: can\'t parse license definition'
  ];

describe('gets licenses from package attribute', () => {
  for (const [index, value] of possibleValues.entries()) {
    it(`#${index + 1} ${typeof value === 'string' ? value : 'object'}`, () => {
      try {
        const licenses = getLicenses(value as Record<string, string> | string);
        assert.deepStrictEqual(licenses, expectedResults[index]);
      } catch (error) {
        // expect(error).toMatchSnapshot();
        assert.deepStrictEqual(error.toString(), expectedResults[index]);
      }
    });
  }
});
