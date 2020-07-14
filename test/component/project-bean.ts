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

export function Controller(options?: IBeanOptions) {
  return beanFactory.makeRegisterAnnotation({
    componentType: 'Controller',
    beanType: BeanType.Singletone,
    beanName: options?.name
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


export const Inject = beanFactory.Inject.bind(beanFactory);
export const Autowired = beanFactory.Autowired.bind(beanFactory);
export const PostConstruct = beanFactory.PostConstruct.bind(beanFactory);
export const PreDestroy = beanFactory.PreDestroy.bind(beanFactory);
