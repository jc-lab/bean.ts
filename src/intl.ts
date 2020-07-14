import {
  BeanFactory
} from './bean-factory';
import {
  BeanType
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

export interface IAttributeAnnotationDefinition {
  targetType: AttributeAnnotationTargetType;
  targetDescriptor: PropertyDescriptor;
  attributeType: string;
  options: any;
}

export interface IBeanDefinition {
  context: BeanFactory;
  componentType: string;
  className: string;
  beanName: string;
  beanType: BeanType;
  constructor: any;
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
