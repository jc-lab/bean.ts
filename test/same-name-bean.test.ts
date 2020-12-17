import * as chai from 'chai';
const expect = chai.expect;

import {
  beanFactory,
  Service
} from './component/project-bean';

function getTestComponentA() {
  @Service()
  class TestComponent {
    public test1(): string {
      return 'test1';
    }
  }

  return TestComponent;
}

function getTestComponentB() {
  @Service()
  class TestComponent {
    public test2(): string {
      return 'test2';
    }
  }
  return TestComponent;
}

describe('Same name component tests', function () {
  const components = {} as any as {
    a: ReturnType<typeof getTestComponentA>,
    b: ReturnType<typeof getTestComponentB>
  };
  beforeEach(() => {
    components.a = getTestComponentA();
    components.b = getTestComponentB();
    return beanFactory.start();
  });
  afterEach(() => beanFactory.stop());
  it('TestComponent A Bean', () => {
    console.log({a: beanFactory});
    const bean = beanFactory.getBeanByClass(components.a);
    const obj = (bean && bean.getObject()) as any;

    expect(bean).to.exist;
    expect(obj).to.exist;
    expect(obj.test1()).eq('test1');
  });
  it('TestComponent B Bean', () => {
    const bean = beanFactory.getBeanByClass(components.b);
    const obj = (bean && bean.getObject()) as any;

    expect(bean).to.exist;
    expect(obj).to.exist;
    expect(obj.test2()).eq('test2');
  });
  it('TestComponents Different', () => {
    const beanA = beanFactory.getBeanByClass(components.a);
    const objA = (beanA && beanA.getObject()) as any;

    const beanB = beanFactory.getBeanByClass(components.b);
    const objB = (beanB && beanB.getObject()) as any;

    console.log({beanA, beanB});

    expect(beanA === beanB).to.false;
    expect(objA === objB).to.false;
  });
});
