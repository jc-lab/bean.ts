import {
  BeanFactory, BeanType, IBeanOptions
} from '../../src';

export const beanFactory = new BeanFactory();

export const installer = beanFactory.installer.bind(beanFactory);

export function Model(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Model',
    beanType: BeanType.Model,
    beanName: options?.name
  });
}

export function Service(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Service',
    beanType: BeanType.Singletone,
    beanName: options?.name
  });
}

export function Controller(options?: IBeanOptions & { testAttr: string }) {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Controller',
    beanType: BeanType.Singletone,
    beanName: options?.name,
    options: options
  });
}

export function RequestMapping(options?: {
  path: string,
  method: string
}) {
  return beanFactory.makeMethodAttributeAnnotation({
    attributeType: 'RequestMapping',
    options: options
  });
}

export function HttpRequestParam() {
  return beanFactory.makeMethodParameterAnnotation({
    attributeType: 'HttpRequestParam',
    options: null
  });
}

export function HttpResponseParam() {
  return beanFactory.makeMethodParameterAnnotation({
    attributeType: 'HttpResponseParam',
    options: null
  });
}

export function Slf4j() {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Slf4j',
    beanType: BeanType.Annotated
  });
}


export const Inject = beanFactory.Inject.bind(beanFactory);
export const Autowired = beanFactory.Autowired.bind(beanFactory);
export const PostConstruct = beanFactory.PostConstruct.bind(beanFactory);
export const PreDestroy = beanFactory.PreDestroy.bind(beanFactory);
