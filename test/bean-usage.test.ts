import {
  DefaultInstanceService
} from './component/default-instance-service';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();

import {
  install, IReflectionClass, IReflectionMethod
} from '../src/';
import {
  beanFactory, Controller, Model, RequestMapping, Slf4j
} from './component/project-bean';
import {
  MemberDTO
} from './component/member-model';
import {MemberService} from "./component/member-service";
import {HelloService} from "./component/hello-service";
import {TestService} from "./component/test-service";
import {StangerComponent} from "./component/stranger-service-and-controller";
import {HelloController} from "./component/hello-controller";
import {MemberController} from "./component/member-controller";

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
    install(require('./component/stranger-service-and-controller'));
  });

  it('default instance test 1', function () {
    expect(DefaultInstanceService.constructCount).eq(1);
  });

  it('default instance test 2', function () {
    expect(DefaultInstanceService.constructCount).eq(1);
  });

  it('getBeansByComponentType', async function () {
    await beanFactory.start();

    const services = beanFactory.getBeansByComponentType('Service');
    expect(services.length).eq(5);

    expect(services.find(v => v.getObject() instanceof MemberService)).to.exist;
    expect(services.find(v => v.getObject() instanceof HelloService)).to.exist;
    expect(services.find(v => v.getObject() instanceof TestService)).to.exist;
    expect(services.find(v => v.getObject() instanceof DefaultInstanceService)).to.exist;
    expect(services.find(v => v.getObject() instanceof StangerComponent)).to.exist;

    const controllers = beanFactory.getBeansByComponentType(Controller);
    expect(controllers.length).eq(3);

    expect(controllers.find(v => v.getObject() instanceof HelloController)).to.exist;
    expect(controllers.find(v => v.getObject() instanceof MemberController)).to.exist;
    expect(controllers.find(v => v.getObject() instanceof StangerComponent)).to.exist;

    await beanFactory.stop();
  });

  it('getBeansByComponentType Annotated', async function () {
    await beanFactory.start();

    const slf4jBeans = beanFactory.getBeansByComponentType(Slf4j);
    expect(slf4jBeans.find(v => v.getObject() instanceof DefaultInstanceService)).to.exist;

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
    expect(controllers.length).eq(3);
    controllers
      .forEach(v => {
        if (v.getBeanName() === 'HelloController') {
          const a = v.getAnnotation(Controller);
          expect(a && a.options.testAttr).eq('abcdefg');
        }
      });

    const requestMappings = controllers
      .map(controller => controller.getMethodsByAnnotation(RequestMapping).map(v => ({v, c: controller})))
      .reduce((list, cur) => {
        list.push(...cur);
        return list;
      }, []);
    expect(requestMappings.length).eq(4);

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
    const smartParameters = requestMappings.find(v => {
      const a = v.v.getAnnotation(RequestMapping);
      return a && (a.options.path === '/smartParameters') && (a.options.method === 'get');
    });
    expect(getUsers).to.exist;
    expect(postUsers).to.exist;
    expect(getHello).to.exist;
    expect(smartParameters).to.exist;

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
    if (smartParameters) {
      const params = smartParameters.v.getParameters();
      expect(params.length).eq(2);
      expect(params[0] && params[0].attributeType).eq('HttpRequestParam');
      expect(params[1] && params[1].attributeType).eq('HttpResponseParam');
    }

    await beanFactory.stop();
  });
});
