import { getLicenseText } from '../src/index';

describe('gets text for license definition', function() {
  it('fixed given license text', function() {
    const text = getLicenseText([{
      license: 'BSD-3-Clause',
      exception: 'GPL-3.0-linking-exception'
    }, {
      license: 'LGPL-2.1',
      plus: true
    }, {
      license: 'MIT'
    }]);
    expect(text).toMatchSnapshot();
  });

  it('unknown license', function() {
    try {
      getLicenseText([{
        license: 'Foo-bar-license'
      }]);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it('unknown exception', function() {
    try {
      getLicenseText([{
        license: 'BSD-3-Clause',
        exception: 'Foo-bar-exception'
      }]);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
