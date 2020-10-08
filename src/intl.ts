import {
  BeanFactory
} from './bean-factory';
import {
  BeanType,
  IAnnotatedMethodParameter
} from './types';

export const S_BeanDefinition = Symbol('BeanDefinition');
export const S_ModuleInstall = Symbol('ModuleInstall');

export enum BeanDependencyType {
  CONSTRUCTOR,
  AUTOWIRE,
}

export enum AttributeAnnotationTargetType {
  Class,
  Method,
}

export interface IBeanDependency {
  type: BeanDependencyType;
  beanName?: string;
  className?: string;

  autowireField: string | symbol | null;
  autowireLazy: boolean;

  constructorIndex?: number;
}

export interface IAttributeAnnotationDefinitionForOther {
  targetType: AttributeAnnotationTargetType.Class;
  targetDescriptor: PropertyDescriptor;
  attributeType: string;
  options: any;
}

export interface IAttributeAnnotationDefinitionForMethod {
  targetType: AttributeAnnotationTargetType.Method;
  targetPropertyKey?: string | symbol;
  targetDescriptor: PropertyDescriptor;
  attributeType: string;
  options: any;
  parameters: (IAnnotatedMethodParameter | undefined)[];
}

export type IAttributeAnnotationDefinition = IAttributeAnnotationDefinitionForOther | IAttributeAnnotationDefinitionForMethod;

export interface IBeanDefinition {
  context: BeanFactory;
  componentTypes: string[];
  className: string;
  beanName: string;
  beanType: BeanType;
  constructor: any;
  existInstance: any;
  dependencies: IBeanDependency[];
  postConstruct: Function | null;
  preDestroy: Function | null;
  attributeAnnotations: IAttributeAnnotationDefinition[];
}

export enum BeanState {
  Uninitialized = 0,
  Initializing = 1,
  Initialized = 2,
  Stopped = 3,
}

export interface IBeanContext extends IBeanDefinition {
  state: BeanState;
  instance: any;
}

export interface ITargetAndBeanDefinition {
  target: any;
  beanDefinition: IBeanDefinition;
}

export function getBeanDefinitionsFromModule(mod: any): ITargetAndBeanDefinition[] {
  const tempMap: Map<string, ITargetAndBeanDefinition> = new Map();
  const check = (target: any) => {
    if (!target) return false;
    let prototype: any = null;
    if (typeof target === 'function') {
      prototype = target.prototype;
    } else if (target instanceof Object) {
      prototype = Object.getPrototypeOf(target);
    }
    if (!prototype) return false;
    const beanDefinition: IBeanDefinition = prototype[S_BeanDefinition];
    if (beanDefinition) {
      tempMap.set(beanDefinition.beanName, {
        beanDefinition, target
      });
      return true;
    }
    return false;
  };
  if (!check(mod)) {
    Object.keys(mod)
      .forEach((key) => {
        check(mod[key]);
      });
  }
  return [...tempMap.values()];
}
