import {
  BeanType, IAttributeAnnotation, IInstancedClass, IReflectionClass, IReflectionMethod,
  IAnnotatedMethodParameter
} from './types';

import {
  AttributeAnnotationTargetType,
  IAttributeAnnotationDefinition,
  IAttributeAnnotationDefinitionForMethod,
  IBeanContext
} from './intl';

const S_BeanContext = Symbol('BeanContext');
const S_Attr = Symbol('Attr');

function getAnnotationImpl(beanContext: IBeanContext, targetType: AttributeAnnotationTargetType, attributeType: Function | string, descriptor?: PropertyDescriptor): IAttributeAnnotation | undefined {
  const attributeTypeText = (typeof attributeType === 'string') ? attributeType : attributeType.name;
  const metadatas = beanContext.attributeAnnotations.find(v =>
    v.attributeType === attributeTypeText &&
    v.targetType === targetType &&
    (descriptor ? (descriptor === v.targetDescriptor) : true)
  );
  return metadatas && {
    attributeType: metadatas.attributeType,
    options: metadatas.options
  };
}

function getAnnotationsImpl(beanContext: IBeanContext, targetType: AttributeAnnotationTargetType, descriptor?: PropertyDescriptor): IAttributeAnnotation[] {
  const metadatas = beanContext.attributeAnnotations.filter(v =>
    v.targetType === targetType &&
    (descriptor ? (descriptor === v.targetDescriptor) : true)
  );
  return metadatas.map(v => ({
    attributeType: v.attributeType,
    options: v.options
  }));
}

function getAnnotationsByTypeImpl(beanContext: IBeanContext, targetType: AttributeAnnotationTargetType, attributeType: Function | string, descriptor?: PropertyDescriptor): IAttributeAnnotation[] {
  const attributeTypeText = (typeof attributeType === 'string') ? attributeType : attributeType.name;
  const metadatas = beanContext.attributeAnnotations.filter(v =>
    v.targetType === targetType &&
    v.attributeType === attributeTypeText &&
    (descriptor ? (descriptor === v.targetDescriptor) : true)
  );
  return metadatas.map(v => ({
    attributeType: v.attributeType,
    options: v.options
  }));
}

function getMethodsByAnnotationImpl(beanContext: IBeanContext, attributeType: Function | string, descriptor?: PropertyDescriptor): IReflectionMethod[] {
  const attributeName = (typeof attributeType === 'string') ? attributeType : attributeType.name;
  const list = beanContext.attributeAnnotations.filter(v =>
    v.attributeType === attributeName &&
    v.targetType === AttributeAnnotationTargetType.Method &&
    (descriptor ? (descriptor === v.targetDescriptor) : true)
  ) as IAttributeAnnotationDefinitionForMethod[];
  return list.map(v => new ReflectionMethod(beanContext, v));
}

export class ReflectionClass<T> implements IReflectionClass<T> {
  private [S_BeanContext]: IBeanContext;

  constructor(beanContext: IBeanContext) {
    this[S_BeanContext] = beanContext;
  }

  getAnnotation(attributeType: Function | string): IAttributeAnnotation | undefined {
    return getAnnotationImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class, attributeType);
  }

  getAnnotations(): IAttributeAnnotation[] {
    return getAnnotationsImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class);
  }

  getAnnotationsByType(attributeType: Function | string): IAttributeAnnotation[] {
    return getAnnotationsByTypeImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class, attributeType);
  }

  newInstance(...parameters: any[]): T {
    if (!this[S_BeanContext].beanType.has(BeanType.Model)) {
      throw new Error(`${this[S_BeanContext].className} is not model`);
    }
    const bindedConstructor = this[S_BeanContext].constructor.bind({}, ...parameters);
    return new bindedConstructor();
  }

  getMethodsByAnnotation(attributeType: Function | string): IReflectionMethod[] {
    return getMethodsByAnnotationImpl(this[S_BeanContext], attributeType);
  }
}

export class InstancedClass<T> implements IInstancedClass<T> {
  private [S_BeanContext]: IBeanContext;

  constructor(beanContext: IBeanContext) {
    this[S_BeanContext] = beanContext;
  }

  getBeanName(): string {
    return this[S_BeanContext].beanName;
  }

  getAnnotation(attributeType: Function | string): IAttributeAnnotation | undefined {
    return getAnnotationImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class, attributeType);
  }

  getAnnotations(): IAttributeAnnotation[] {
    return getAnnotationsImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class);
  }

  getAnnotationsByType(attributeType: Function | string): IAttributeAnnotation[] {
    return getAnnotationsByTypeImpl(this[S_BeanContext], AttributeAnnotationTargetType.Class, attributeType);
  }

  getObject(): T {
    return this[S_BeanContext].instance;
  }

  newInstance(...parameters: any[]): T {
    throw new Error(`${this[S_BeanContext].className} is not model`);
  }

  getMethodsByAnnotation(attributeType: Function | string): IReflectionMethod[] {
    return getMethodsByAnnotationImpl(this[S_BeanContext], attributeType);
  }
}

function getFunctionFromAnnotation(definition: IAttributeAnnotationDefinition): Function {
  const descriptor = definition.targetDescriptor;
  const func: Function | undefined = descriptor.value || descriptor.get && descriptor.get();
  if (!func) {
    throw new Error('Not exists method');
  }
  return func;
}

export class ReflectionMethod implements IReflectionMethod {
  private [S_BeanContext]: IBeanContext;
  private [S_Attr]: IAttributeAnnotationDefinitionForMethod;

  constructor(beanContext: IBeanContext, attr: IAttributeAnnotationDefinitionForMethod) {
    this[S_BeanContext] = beanContext;
    this[S_Attr] = attr;
  }

  apply(thisArg: any, argArray?: any): any {
    const func = getFunctionFromAnnotation(this[S_Attr]);
    return func.apply(thisArg, argArray);
  }

  bind(thisArg: any, ...argArray: any[]): any {
    const func = getFunctionFromAnnotation(this[S_Attr]);
    return func.bind(thisArg, ...argArray);
  }

  call(thisArg: any, ...argArray: any[]): any {
    const func = getFunctionFromAnnotation(this[S_Attr]);
    return func.call(thisArg, ...argArray);
  }

  getParameters(): (IAnnotatedMethodParameter | undefined)[] {
    return this[S_Attr].parameters;
  }

  getAnnotation(attributeType: Function | string): IAttributeAnnotation | undefined {
    return getAnnotationImpl(this[S_BeanContext], AttributeAnnotationTargetType.Method, attributeType, this[S_Attr].targetDescriptor);
  }

  getAnnotations(): IAttributeAnnotation[] {
    return getAnnotationsImpl(this[S_BeanContext], AttributeAnnotationTargetType.Method, this[S_Attr].targetDescriptor);
  }

  getAnnotationsByType(attributeType: Function | string): IAttributeAnnotation[] {
    return getAnnotationsByTypeImpl(this[S_BeanContext], AttributeAnnotationTargetType.Method, attributeType, this[S_Attr].targetDescriptor);
  }
}
