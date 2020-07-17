const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

import {
  install, IReflectionClass, IReflectionMethod
} from '../src/';
import {
  beanFactory, Controller, Model, RequestMapping
} from './component/project-bean';
import {
  MemberDTO
} from './component/member-model';

describe('Bean Test', function () {
  beforeEach(function () {
    beanFactory.reset();
    install(require('./component/member-model'));
    install(require('./component/member-service'));
    install(require('./component/hello-service'));
    install(require('./component/test-service'));
    install(require('./component/hello-controller'));
    install(require('./component/member-controller'));
    install(require('./component/default-instance-service'));
  });

  it('getBeansByComponentType', async function () {
    await beanFactory.start();

    const services = beanFactory.getBeansByComponentType('Service');
    expect(services.length).eq(4);

    const controllers = beanFactory.getBeansByComponentType(Controller);
    expect(controllers.length).eq(2);

    await beanFactory.stop();
  });

  it('getModelsByComponentType', async function () {
    await beanFactory.start();

    const models1 = beanFactory.getModelsByComponentType(Model);
    expect(models1.length).eq(1);

    const models2 = beanFactory.getModelsByComponentType('Model');
    expect(models2.length).eq(1);

    await beanFactory.stop();
  });
  it('getModel', async function () {
    await beanFactory.start();

    const model1: IReflectionClass<MemberDTO> | null = beanFactory.getModelByClass(MemberDTO);
    expect(model1).to.exist;
    if (model1) {
      expect(model1.newInstance()).to.be.an.instanceof(MemberDTO);
    }

    const model2: IReflectionClass<MemberDTO> | null = beanFactory.getModelByClass<MemberDTO>('MemberDTO');
    expect(model2).to.exist;
    if (model2) {
      expect(model2.newInstance()).to.be.an.instanceof(MemberDTO);
    }

    const model3: IReflectionClass<MemberDTO> | null = beanFactory.getModelByName<MemberDTO>('MemberDTO');
    expect(model3).to.exist;
    if (model3) {
      expect(model3.newInstance()).to.be.an.instanceof(MemberDTO);
    }

    await beanFactory.stop();
  });

  it('annotations', async function () {
    await beanFactory.start();

    const controllers = beanFactory.getBeansByComponentType(Controller);
    expect(controllers.length).eq(2);

    const requestMappings = controllers
      .map(controller => controller.getMethodsByAnnotation(RequestMapping).map(v => ({v, c: controller})))
      .reduce((list, cur) => {
        list.push(...cur);
        return list;
      }, []);
    expect(requestMappings.length).eq(3);

    const getUsers = requestMappings.find(v => {
      const a = v.v.getAnnotation(RequestMapping);
      return a && (a.options.path === '/member/users') && (a.options.method === 'get');
    });
    const postUsers = requestMappings.find(v => {
      const a = v.v.getAnnotation(RequestMapping);
      return a && (a.options.path === '/member/users') && (a.options.method === 'post');
    });
    const getHello = requestMappings.find(v => {
      const a = v.v.getAnnotation(RequestMapping);
      return a && (a.options.path === '/hello') && (a.options.method === 'get');
    });
    expect(getUsers).to.exist;
    expect(postUsers).to.exist;
    expect(getHello).to.exist;

    if (getHello) {
      const temp = getHello.v.apply(getHello.c.getObject(), [10, 20]);
      expect(temp).eq('called hello, a=10, b=20, c=30');
    }
    if (getUsers) {
      const temp = getUsers.v.apply(getUsers.c.getObject(), [10, 20]);
      expect(temp).eq('called get users, a=10, b=20');
    }
    if (postUsers) {
      const temp = postUsers.v.apply(postUsers.c.getObject(), [10, 20]);
      expect(temp).eq('called post users, a=10, b=20');
    }

    await beanFactory.stop();
  });
});
