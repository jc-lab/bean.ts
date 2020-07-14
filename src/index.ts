import {
  BeanFactory 
} from './bean-factory';
import {
  S_BeanDefinition, IBeanDefinition, S_ModuleInstall
} from './intl';

function install(mod: any) {
  Object.keys(mod)
    .forEach(key => {
      const target = mod[key];
      if (target) {
        const beanDefinition: IBeanDefinition = target[S_BeanDefinition] || (target.prototype && target.prototype[S_BeanDefinition]);
        if (beanDefinition) {
          beanDefinition.context[S_ModuleInstall](beanDefinition, target);
        }
      }
    });
}

export * from './types';
export {BeanFactory,
  install};
