import {
  BeanType,
  IAutowiredOptions,
  IInjectOptions,
  IMakeAnnotationOptions,
  IAttributeAnnotation,
  IReflectionClass,
  IInstancedClass,
  IReflectionMethod,
  ConstructorType,
  PostConstructFunction,
  PreDestroyFunction,
  IAnnotatedMethodParameter
} from './types';
import {
  AttributeAnnotationTargetType,
  BeanDependencyType,
  BeanState, IBeanContext,
  IAttributeAnnotationDefinitionForMethod,
  IBeanDefinition,
  IBeanDependency,
  S_BeanDefinition,
  S_ModuleInstall
} from './intl';
import {
  InstancedClass, ReflectionClass
} from './reflection';

export type WarnLogOutput = (e: Error) => void;

function dumpDependencyPrefix(depth: number) {
  return (depth > 1 ? '+' : '') + '-'.repeat( depth - 1) + (depth > 1 ? ' ' : '');
}

export class BeanFactory {
  public warnLog: WarnLogOutput | null = (e) => {
    console.warn('[bean.ts] warning: ', e);
  };

  private _beanDefinitions!: IBeanDefinition[];
  private _beanContextMap!: Map<string, IBeanContext>;
  private _beanClassMap!: Map<string, IBeanContext[]>;

  public constructor() {
    this.reset();
  }

  public makeRegisterAnnotation<T extends Function>(options: IMakeAnnotationOptions): ClassDecorator {
    const beanType = typeof options.beanType === 'undefined' ? BeanType.Singletone : options.beanType;
    return <TFunction extends Function>(target: TFunction): TFunction | void => {
      const beanName = options.beanName || target.name;
      const beanDefinition = this._getBeanDefinition(target, 'class');
      beanDefinition.className = target.name;
      beanDefinition.beanName = beanName;
      beanDefinition.beanType.add(beanType);
      beanDefinition.constructor = target;
      beanDefinition.componentTypes.push(options.componentType);
      beanDefinition.attributeAnnotations.push({
        targetType: AttributeAnnotationTargetType.Class,
        targetDescriptor: null as any,
        attributeType: options.componentType,
        options: options.options
      });
      if (!this._beanDefinitions.find(v => v === beanDefinition)) {
        this._beanDefinitions.push(beanDefinition);
      }
      return target;
    };
  }

  private _getAttributeAnnotationsForMethod(beanDefinition: IBeanDefinition, propertyKey: string | symbol): IAttributeAnnotationDefinitionForMethod {
    let item: IAttributeAnnotationDefinitionForMethod = beanDefinition.attributeAnnotations
      .find(v =>
        v.targetType === AttributeAnnotationTargetType.Method &&
        v.targetPropertyKey === propertyKey
      ) as IAttributeAnnotationDefinitionForMethod;
    if (!item) {
      item = {
        targetType: AttributeAnnotationTargetType.Method,
        targetPropertyKey: propertyKey,
        targetDescriptor: undefined as any,
        attributeType: undefined as any,
        options: undefined as any,
        parameters: undefined as any
      };
      beanDefinition.attributeAnnotations.push(item);
    }
    return item;
  }

  private _preinitAttributeAnnotationsForMethod(object: IAttributeAnnotationDefinitionForMethod, descriptor: TypedPropertyDescriptor<any>) {
    const func: Function = (descriptor.value as any);
    const parameters: IAnnotatedMethodParameter[] = Array<IAnnotatedMethodParameter>(func.length);
    object.targetDescriptor = descriptor;
    if (!object.parameters) {
      object.parameters = parameters;
    } else if (object.parameters.length != func.length) {
      for (let i = 0; i < parameters.length; i++) {
        if (!object.parameters[i]) {
          object.parameters[i] = undefined as any;
        }
      }
    }
  }

  public makeMethodAttributeAnnotation<T extends Function>(options: IAttributeAnnotation): MethodDecorator {
    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      const definedMethod = this._getAttributeAnnotationsForMethod(beanDefinition, propertyKey);
      definedMethod.targetDescriptor = descriptor;
      definedMethod.attributeType = options.attributeType;
      definedMethod.options = options.options;
      this._preinitAttributeAnnotationsForMethod(definedMethod, descriptor);
    };
  }

  public makeMethodParameterAnnotation<T extends Function>(options: IAttributeAnnotation): ParameterDecorator {
    return <T>(target: Object, propertyKey: string | symbol, parameterIndex: number): TypedPropertyDescriptor<T> | void => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      const definedMethod = this._getAttributeAnnotationsForMethod(beanDefinition, propertyKey);
      if (!definedMethod.parameters) {
        definedMethod.parameters = [];
      }
      definedMethod.parameters[parameterIndex] = {
        index: parameterIndex,
        attributeType: options.attributeType,
        options: options.options
      };
    };
  }

  private _propertyNameToBeanName(input: string): string {
    return input.replace(/(_?)([a-z])(.*)/g, (text, first, second, third) => {
      return second.toUpperCase() + third;
    });
  }

  public Autowired<T>(injectType: ConstructorType<T>, options?: IAutowiredOptions): PropertyDecorator {
    return (target: Object, propertyName: string | symbol): void => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      const lazy = options && options.lazy || false;

      if (options && options.name) {
        beanDefinition.dependencies.push({
          type: BeanDependencyType.AUTOWIRE,
          autowireField: propertyName,
          autowireLazy: lazy,
          beanName: options.name,
          className: injectType && injectType.name
        });
      } else if (typeof propertyName === 'string') {
        beanDefinition.dependencies.push({
          type: BeanDependencyType.AUTOWIRE,
          autowireField: propertyName,
          autowireLazy: lazy,
          beanName: this._propertyNameToBeanName(propertyName),
          className: injectType && injectType.name
        });
      } else {
        throw new Error('property name must be string without beanName');
      }
    };
  }

  public Inject<T>(injectType: ConstructorType<T>, options?: IInjectOptions): ParameterDecorator {
    if (!injectType && this.warnLog) {
      this.warnLog(new Error('Detecting the possibility of circular dependence on compiling. injectType is undefined'));
    }
    return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      if (options && options.name) {
        beanDefinition.dependencies.push({
          type: BeanDependencyType.CONSTRUCTOR,
          autowireField: null,
          autowireLazy: false,
          beanName: options.name,
          className: injectType && injectType.name,
          constructorIndex: parameterIndex
        });
      } else {
        if (!(injectType && injectType.name)) {
          throw new Error('injectType or bean name must be explicit');
        }
        beanDefinition.dependencies.push({
          type: BeanDependencyType.CONSTRUCTOR,
          autowireField: null,
          autowireLazy: false,
          className: injectType && injectType.name,
          constructorIndex: parameterIndex
        });
      }
    };
  }

  public PostConstruct(options?: IAutowiredOptions) {
    return (target: Object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<PostConstructFunction>): TypedPropertyDescriptor<PostConstructFunction> => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      if (typeof descriptor.value !== 'function') {
        throw Error('@PostConstructor is can use only to method');
      }
      beanDefinition.postConstruct = descriptor.value;
      return descriptor;
    };
  }

  public PreDestroy(options?: IAutowiredOptions) {
    return (target: Object, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<PreDestroyFunction>): TypedPropertyDescriptor<PreDestroyFunction> => {
      const beanDefinition = this._getBeanDefinition(target, 'prototype');
      if (typeof descriptor.value !== 'function') {
        throw Error('@PreDestroy is can use only to method');
      }
      beanDefinition.preDestroy = descriptor.value;
      return descriptor;
    };
  }

  private _getBeanDefinition(target: any, targetType?: 'class' | 'prototype'): IBeanDefinition {
    let prototype;
    if ((targetType === 'class') || (typeof target === 'function')) {
      if (!target.prototype) {
        target.prototype = {};
      }
      prototype = target.prototype;
    } else if (targetType === 'prototype') {
      prototype = target;
    } else {
      prototype = Object.getPrototypeOf(target);
    }
    if (prototype[S_BeanDefinition]) {
      return prototype[S_BeanDefinition];
    }
    const beanDefinition: IBeanDefinition = {
      context: this,
      className: '',
      beanName: '',
      componentTypes: [],
      beanType: new Set<BeanType>(),
      dependencies: [],
      constructor: null as any,
      existInstance: null,
      postConstruct: null,
      preDestroy: null,
      attributeAnnotations: []
    };
    Object.defineProperty(prototype, S_BeanDefinition, {
      value: beanDefinition,
      writable: false
    });
    return beanDefinition;
  }

  /**
   * Module install explicitly
   * @param beanDefinition
   * @param target
   * @description
   *  It is usually not used.
   *  It is used when re-installation is required like Test.
   */
  public [S_ModuleInstall](beanDefinition: IBeanDefinition, target: any) {
    if (!this._beanDefinitions.find(v => v === beanDefinition)) {
      this._beanDefinitions.push(beanDefinition);
    }
    if (target instanceof beanDefinition.constructor) {
      beanDefinition.existInstance = target;
    }
  }

  public installer(): void {
    // dummy
  }

  private _initBean(beanContext: IBeanContext): Promise<void> {
    if (beanContext.beanType.has(BeanType.Singletone)) {
      if (beanContext.state == BeanState.Initialized) {
        return Promise.resolve();
      }
      if (beanContext.state === BeanState.Initializing) {
        this.dumpDependencies();
        return Promise.reject(new Error(`circular dependency detected: beanName=${beanContext.beanName}`));
      }

      beanContext.state = BeanState.Initializing;

      const constructorParameterList: any[] = [];
      return beanContext.dependencies.reduce(
        (prev, cur) =>
          prev
            .then(() => this._beanContextFromAw(cur))
            .then(awBeanCtx => {
              return (() => {
                if (!cur.autowireLazy) {
                  return this._initBean(awBeanCtx);
                } else {
                  return Promise.resolve();
                }
              })()
                .then(() => {
                  if (typeof cur.constructorIndex !== 'undefined') {
                    if (!awBeanCtx.instance) {
                      this.dumpDependencies();
                      return Promise.reject(new Error(`need eager beanName=${awBeanCtx.beanName} from beanName=${beanContext.beanName}, constructorIndex=${cur.constructorIndex}`));
                    }
                    constructorParameterList[cur.constructorIndex] = awBeanCtx.instance;
                  }
                });
            }),
        Promise.resolve()
      )
        .then(() => {
          if (beanContext.existInstance) {
            beanContext.instance = beanContext.existInstance;
          } else {
            const bindedConstructor = beanContext.constructor.bind({}, ...constructorParameterList);
            beanContext.instance = new bindedConstructor();
          }
          return Promise.resolve();
        })
        .then(() => beanContext.dependencies.reduce(
          (prev, cur) =>
            prev.then(() => this._beanContextFromAw(cur))
              .then(awBeanCtx => {
                if (cur.autowireField) {
                  if (cur.autowireLazy) {
                    Object.defineProperty(beanContext.instance, cur.autowireField, {
                      get: () => {
                        if (!awBeanCtx.instance) {
                          throw new Error(`Unknown beanName=${awBeanCtx.beanName}`);
                        }
                        return awBeanCtx.instance;
                      },
                      configurable: false
                    });
                  } else {
                    Object.defineProperty(beanContext.instance, cur.autowireField, {
                      value: awBeanCtx.instance,
                      configurable: !!beanContext.existInstance,
                      writable: false
                    });
                  }
                }
              })
          ,
          Promise.resolve()
        ))
        .then(() => {
          beanContext.state = BeanState.Initialized;
          return Promise.resolve();
        });
    //
    //
    //
    //
    //
    //
    //   beanContext.instance = new beanContext.constructor();
    //   return beanContext.autowires.reduce(
    //     (prev, cur) =>
    //       prev.then(() => {
    //         return this._initAutowired(beanContext.instance, cur);
    //       }),
    //     Promise.resolve()
    //   ).then(() => {
    //     beanContext.state = BeanState.Initialized;
    //     return Promise.resolve();
    //   });
    }
    return Promise.resolve();
  }

  private _beanContextFromAw(awDefinition: IBeanDependency): Promise<IBeanContext> {
    let tempAwBeanDef: IBeanContext | undefined;
    if (awDefinition.beanName) {
      tempAwBeanDef = this._beanContextMap.get(awDefinition.beanName);
    }
    if (awDefinition.className) {
      const list = this._beanClassMap.get(awDefinition.className);
      if (list && list.length === 1) {
        tempAwBeanDef = list[0];
      }
      if (list && list.length > 1) {
        return Promise.reject(new Error(`Duplicated class=${awDefinition.className}`));
      }
    }
    if (!tempAwBeanDef) {
      return Promise.reject(new Error(`Unknown beanName=${awDefinition.beanName}`));
    }
    return Promise.resolve(tempAwBeanDef);
  }

  private _dumpDependenciesImpl(stack: any[]) {
    const depth = stack.length;
    const topItem: IBeanContext = stack[depth - 1].item;
    const lazyText = stack[depth - 1].lazy ? ' (Lazy)' : '';
    const isLazy = stack.reduce((prev, cur) => prev || cur.lazy, false);
    console.log(`${dumpDependencyPrefix(depth)}${topItem.beanName} [${topItem.className}]${lazyText}`);
    topItem.dependencies.forEach(temp => {
      const child: IBeanContext = this._findBeanContext(temp) as IBeanContext;
      if (child) {
        if (stack.findIndex(v => v.item === child) >= 0) {
          if (temp.autowireLazy) {
            console.log(`${dumpDependencyPrefix(depth + 1)}${child.beanName} (Lazy)`);
          } else if (!isLazy) {
            console.log(`${dumpDependencyPrefix(depth + 1)}${child.beanName} (Circular!)`);
          }
        } else {
          stack.push({
            item: child,
            lazy: temp.autowireLazy
          });
          this._dumpDependenciesImpl(stack);
          stack.pop();
        }
      }
    });
  }

  public dumpDependencies() {
    this._beanDefinitions.forEach(temp => {
      const item: IBeanContext = this._beanContextMap.get(temp.beanName) as IBeanContext;
      const stack: any = [{
        item, lazy: false
      }];
      this._dumpDependenciesImpl(stack);
    });
  }

  private _stopBean(beanContext: IBeanContext): Promise<void> {
    if (beanContext.beanType.has(BeanType.Singletone)) {
      if (beanContext.state === BeanState.Stopped) {
        return Promise.resolve();
      }

      const execute = () => {
        if (beanContext.preDestroy) {
          try {
            return Promise.resolve(beanContext.preDestroy.call(beanContext.instance));
          } catch (e) {
            return Promise.reject(e);
          }
        }
        return Promise.resolve();
      };

      return execute()
        .catch(e => {
          if (this.warnLog) {
            this.warnLog(e);
          }
          return Promise.resolve();
        })
        .then(() => {
          beanContext.state = BeanState.Stopped;
        });
    }
    return Promise.resolve();
  }

  private _findBeanContext(opts: {
    beanName?: string,
    className?: string
  }): IBeanContext | undefined {
    if (opts.beanName) {
      const found = this._beanContextMap.get(opts.beanName);
      if (found) {
        return found;
      }
    }
    if (opts.className) {
      const temp = this._beanClassMap.get(opts.className);
      if (temp && temp.length === 1) {
        return temp[0];
      }
    }
    return undefined;
  }

  public start(): Promise<void> {
    this._beanDefinitions.forEach(info => {
      const item = {
        ...info,
        state: BeanState.Uninitialized,
        instance: null
      };
      this._beanContextMap.set(item.beanName, item);

      const listByClass = this._beanClassMap.get(item.className);
      if (listByClass) {
        listByClass.push(item);
      } else {
        this._beanClassMap.set(item.className, [item]);
      }
    });
    return this._beanDefinitions.reduce(
      (prev, cur) => prev.then(() => this._initBean(this._beanContextMap.get(cur.beanName) as any)),
      Promise.resolve()
    )
      .then(() => this._beanDefinitions.reduce(
        (prev, cur) => prev.then(() => {
          const beanContext = this._beanContextMap.get(cur.beanName) as IBeanContext;
          if (beanContext.postConstruct) {
            try {
              return Promise.resolve(beanContext.postConstruct.call(beanContext.instance));
            } catch (e) {
              return Promise.reject(e);
            }
          }
          return Promise.resolve();
        }
        ), Promise.resolve()))
      .then(() => {});
  }

  public stop(): Promise<void> {
    return this._beanDefinitions.reduce(
      (prev, cur) => prev.then(() => this._stopBean(this._beanContextMap.get(cur.beanName) as any)),
      Promise.resolve()
    );
  }

  public reset() {
    this._beanDefinitions = [];
    this._beanContextMap = new Map();
    this._beanClassMap = new Map();
  }

  public getBeanByName<T>(beanName: string): IInstancedClass<T> | null {
    const beanContext = this._beanContextMap.get(beanName);
    if (!beanContext) {
      return null;
    }
    return new InstancedClass(beanContext);
  }

  public getBeanObjectByName<T>(beanName: string): T | null {
    const bean = this.getBeanByName<T>(beanName);
    return bean && bean.getObject();
  }

  public getBeanByClass<T>(requiredType: string | ConstructorType<T>): IInstancedClass<T> | null {
    const className = typeof requiredType === 'string' ? requiredType : requiredType.name;
    const beanContext = this._beanClassMap.get(className);
    if (!beanContext || beanContext.length != 1) {
      return null;
    }
    return new InstancedClass<T>(beanContext[0]);
  }

  public getBeanObjectByClass<T>(requiredType: string | ConstructorType<T>): T | null {
    const bean = this.getBeanByClass<T>(requiredType);
    return bean && bean.getObject();
  }

  public getModelByName<T>(beanName: string): IReflectionClass<T> | null {
    const beanContext = this._beanContextMap.get(beanName);
    if (!beanContext) {
      return null;
    }
    if (!beanContext.beanType.has(BeanType.Model)) {
      throw new Error(`Unknown model by modelName=${beanName}`);
    }
    return new ReflectionClass(beanContext);
  }

  public getModelByClass<T>(requiredType: string | ConstructorType<T>): IReflectionClass<T> | null {
    const className = typeof requiredType === 'string' ? requiredType : requiredType.name;
    const beanContext = this._beanClassMap.get(className);
    if (!beanContext || beanContext.length != 1) {
      return null;
    }
    if (!beanContext[0].beanType.has(BeanType.Model)) {
      throw new Error(`Unknown model by className=${requiredType}`);
    }
    return new ReflectionClass<T>(beanContext[0]);
  }

  public getBeansByComponentType(componentType: string | Function): IInstancedClass<any>[] {
    const componentTypeName = typeof componentType === 'string' ? componentType : componentType.name;
    return this._beanDefinitions.reduce(
      (list, cur) => {
        const beanContext = this._beanContextMap.get(cur.beanName) as IBeanContext;
        if (beanContext.componentTypes.findIndex(v => v === componentTypeName) >= 0) {
          list.push(new InstancedClass(beanContext));
        }
        return list;
      },
      [] as IInstancedClass<any>[]
    );
  }

  public getModelsByComponentType(componentType: string | Function): IReflectionClass<any>[] {
    const componentTypeName = typeof componentType === 'string' ? componentType : componentType.name;
    return this._beanDefinitions.reduce(
      (list, cur) => {
        const beanContext = this._beanContextMap.get(cur.beanName) as IBeanContext;
        if (beanContext.componentTypes.findIndex(v => v === componentTypeName) >= 0) {
          list.push(new ReflectionClass(beanContext));
        }
        return list;
      },
      [] as IReflectionClass<any>[]
    );
  }
}

