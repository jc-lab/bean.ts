export type PostConstructFunction = () => void | Promise<any>;
export type PreDestroyFunction = () => void | Promise<any>;
export type ConstructorType<T> = (new (...args: any) => T);

export enum BeanType {
  Singletone,
  Model
}

export interface IMakeAnnotationOptions {
  componentType: string;
  beanType: BeanType;
  beanName?: string;
}

export interface IAttributeAnnotation {
  attributeType: string;
  options: any;
}

export interface IAutowiredOptions {
  name?: string;
  lazy?: boolean;
}

export interface IInjectOptions {
  name?: string;
}

export interface IBeanOptions {
  name?: string;
}

export interface IReflectionClass<T> {
  getAnnotations(): IAttributeAnnotation[] | undefined;
  getAnnotationsByType(attributeType: Function | string): IAttributeAnnotation[];
  getAnnotation(attributeType: Function | string): IAttributeAnnotation | undefined;
  newInstance(...parameters: any[]): T;
  getMethodsByAnnotation(attributeType: Function | string): IReflectionMethod[];
}

export interface IInstancedClass<T> extends IReflectionClass<T> {
  getObject(): T;
}

export interface IReflectionMethod {
  getAnnotations(): IAttributeAnnotation[] | undefined;
  getAnnotationsByType(attributeType: Function | string): IAttributeAnnotation[];
  getAnnotation(attributeType: Function | string): IAttributeAnnotation | undefined;
  apply(thisArg: any, argArray?: any): any;
  call(thisArg: any, ...argArray: any[]): any;
  bind(thisArg: any, ...argArray: any[]): any;
}

export interface IInstanceMethod extends IReflectionMethod {
  getTarget(): Object;
}
