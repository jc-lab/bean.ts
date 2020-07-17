import {
  MemberDTO
} from './component/member-model';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

import {
  getBeanDefinitionsFromModule
} from '../src/intl';
import {
  beanFactory
} from './component/project-bean';
import {
  DefaultInstanceService
} from './component/default-instance-service';

import defaultInstanceService from './component/default-instance-service';

describe('Bean Installation Test', function () {
  beforeEach(function () {
    beanFactory.reset();
    require('./component/member-model');
    require('./component/member-service');
    require('./component/hello-service');
    require('./component/test-service');
    require('./component/hello-controller');
    require('./component/member-controller');
  });

  it('find bean definitions - export component', async function () {
    const list = getBeanDefinitionsFromModule(require('./component/member-model'));
    expect(list.length).eq(1);
    const first = list[0];
    expect(first.target).eq(MemberDTO);
    expect(first.beanDefinition.context).eq(beanFactory);
  });

  it('find bean definitions - export instance', async function () {
    const list = getBeanDefinitionsFromModule(defaultInstanceService);
    console.log(list);

    expect(list.length).eq(1);
    const first = list[0];

    expect(first.target).instanceOf(DefaultInstanceService);
  });
});
